import {ethers} from 'ethers';

import {PartialJsonRpcRequest} from '@app/types';
import {isValidHex, isValidJSON} from '@app/utils';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

import {AddressUtils} from './address-utils';

export enum EthereumSignInValuesKeys {
  URI = 'URI',
  Version = 'Version',
  ChainID = 'Chain ID',
  Nonce = 'Nonce',
  IssuedAt = 'Issued At',
  ExpirationTime = 'Expiration Time',
  NotBefore = 'Not Before',
  RequestID = 'Request ID',
  Resources = 'Resources',
}

export type EthereumSignInMessage = {
  message: string;
  address: string;
  statement: string;
  values: Record<EthereumSignInValuesKeys, string | Array<string>>;
};

export class EthereumMessageChecker {
  public static checkRequest(request: PartialJsonRpcRequest) {
    switch (request.method) {
      case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
      case EIP155_SIGNING_METHODS.ETH_SIGN:
        const message: string = request.params.filter(
          (p: string) => !AddressUtils.isEthAddress(p) && !!p,
        )[0];
        return EthereumMessageChecker.checkString(message);
      default:
        return {
          isHex: false,
          parsedTx: null,
          signInMessage: null,
        };
    }
  }

  public static checkString(message: string) {
    const hexString = message.replace(/^0x/, '');
    const decodedSignMessage: string =
      EthereumMessageChecker.decodeMessage(message);
    let parsedTx: ethers.Transaction | null = null;
    try {
      parsedTx = ethers.utils.parseTransaction(Buffer.from(hexString, 'hex'));
      Object.entries(parsedTx).forEach(([key, value]) => {
        if (value?._isBigNumber) {
          // @ts-ignore
          parsedTx[key] = value.toString();
        }
      });
    } catch {}

    if (!parsedTx) {
      try {
        if (isValidJSON(decodedSignMessage)) {
          let isTxJson = false;
          ['to', 'from', 'value', 'data'].forEach(key => {
            if (key in decodedSignMessage) {
              isTxJson = true;
            }
          });
          if (isTxJson) {
            parsedTx = decodedSignMessage as ethers.Transaction;
          }
        }
      } catch {}
    }

    return {
      isHex: isValidHex(message),
      parsedTx,
      signInMessage:
        EthereumMessageChecker.parseEthereumSigninMsg(decodedSignMessage),
    };
  }

  public static decodeMessage(message: string) {
    try {
      const parsedMessage = message?.startsWith('0x')
        ? message.slice(2)
        : message;

      if (isValidJSON(parsedMessage)) {
        return parsedMessage;
      }

      const utf8 = Buffer.from(parsedMessage, 'hex').toString('utf8');
      return utf8 || parsedMessage;
    } catch {
      return message;
    }
  }

  // https://docs.login.xyz/general-information/siwe-overview/eip-4361
  public static parseEthereumSigninMsg(
    msg: string,
  ): EthereumSignInMessage | null {
    try {
      const parts = msg.split('\n').filter(p => p?.trim().length > 0);
      const [message, address, statement, ...keyValues] = parts;

      if (!message || !address || !statement || keyValues?.length === 0) {
        return null;
      }

      const values = keyValues
        .map(kv => {
          const [key, value] = kv.split(/:\s/);
          return [key, value];
        })
        .reduce(
          (prev, [key, value]) => {
            if (key.startsWith('- ')) {
              const lastKey = Object.keys(
                prev,
              ).pop() as EthereumSignInValuesKeys;
              if (Array.isArray(prev[lastKey])) {
                return {
                  ...prev,
                  [lastKey]: [
                    ...(prev[lastKey] as Array<string | number>),
                    key.slice(2),
                  ],
                };
              } else {
                return {
                  ...prev,
                  [lastKey]: [key.slice(2)],
                };
              }
            } else {
              return {
                ...prev,
                [key.replace(':', '')]: value,
              };
            }
          },
          {} as Record<EthereumSignInValuesKeys, string | Array<string>>,
        );

      if (
        !EthereumMessageChecker.validateEthereumSigninMsg(
          message,
          address,
          statement,
          values,
        )
      ) {
        return null;
      }

      return {
        message,
        address,
        statement,
        values,
      };
    } catch {
      return null;
    }
  }

  // https://docs.login.xyz/general-information/siwe-overview/eip-4361
  public static isValidEthereumSigninMsg(msg: string) {
    const parsed = EthereumMessageChecker.parseEthereumSigninMsg(msg);

    if (!parsed) {
      return false;
    }

    return EthereumMessageChecker.validateEthereumSigninMsg(
      parsed.message,
      parsed.address,
      parsed.statement,
      parsed.values,
    );
  }

  // https://docs.login.xyz/general-information/siwe-overview/eip-4361
  public static validateEthereumSigninMsg(
    message: string,
    address: string,
    statement: string,
    values: Record<EthereumSignInValuesKeys, string | Array<string>>,
  ) {
    if (!address || !message || !statement || !values) {
      return false;
    }

    if (!AddressUtils.isValidAddress(address)) {
      return false;
    }

    if (typeof message !== 'string' || typeof statement !== 'string') {
      return false;
    }

    if (!message.includes('wants you to sign in with your Ethereum account:')) {
      return false;
    }

    let hasEmptyValues = false;
    let hasIncorrectValues = false;
    let hasPhishingTxRequest = false;

    Object.entries(values).forEach(([key, value]) => {
      if (!value) {
        hasEmptyValues = true;
        return;
      }
      if (typeof value !== 'string' && !Array.isArray(value)) {
        hasIncorrectValues = true;
        return;
      }
      const {parsedTx: keyHasTx} = EthereumMessageChecker.checkString(key);

      if (keyHasTx && Object.values(keyHasTx).length) {
        hasPhishingTxRequest = true;
        return;
      }

      if (typeof value === 'string') {
        const {parsedTx: valueHasTx} =
          EthereumMessageChecker.checkString(value);
        if (valueHasTx && Object.values(valueHasTx).length) {
          hasPhishingTxRequest = true;
          return;
        }
      }

      if (Array.isArray(value)) {
        value.forEach(v => {
          const {parsedTx: valueHasTx} = EthereumMessageChecker.checkString(
            v as string,
          );
          if (valueHasTx && Object.values(valueHasTx).length) {
            hasPhishingTxRequest = true;
            return;
          }
        });
      }
    });

    if (hasEmptyValues || hasIncorrectValues || hasPhishingTxRequest) {
      return false;
    }

    return true;
  }
}
