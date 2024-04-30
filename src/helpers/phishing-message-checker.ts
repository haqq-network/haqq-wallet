import {ethers} from 'ethers';

import {PartialJsonRpcRequest} from '@app/types';
import {getSignParamsMessage, isValidHex, isValidJSON} from '@app/utils';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

import {AddressUtils} from './address-utils';

export class PhishingMessageChecker {
  public static check(request: PartialJsonRpcRequest) {
    switch (request.method) {
      case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
      case EIP155_SIGNING_METHODS.ETH_SIGN:
        const message: string = request.params.filter(
          (p: string) => !AddressUtils.isEthAddress(p) && !!p,
        )[0];
        // const message =
        //   '0xee82015585066720b30082520894682c67f2f01bc14eb64f280c2c51524f737b1acd8609184e72a0008082d3c38080';

        const hexString = message.replace(/^0x/, '');

        let parsedTx: ethers.Transaction | null = null;
        try {
          parsedTx = ethers.utils.parseTransaction(
            Buffer.from(hexString, 'hex'),
          );
          Object.entries(parsedTx).forEach(([key, value]) => {
            if (value?._isBigNumber) {
              // @ts-ignore
              parsedTx[key] = value.toString();
            }
          });
        } catch {}

        if (!parsedTx) {
          try {
            const ethSignMessage: string =
              getSignParamsMessage(request.params) || '';
            if (isValidJSON(ethSignMessage)) {
              let isTxJson = false;
              ['to', 'from', 'value', 'data'].forEach(key => {
                if (key in ethSignMessage) {
                  isTxJson = true;
                }
              });
              if (isTxJson) {
                parsedTx = ethSignMessage as ethers.Transaction;
              }
            }
          } catch {}
        }

        return {
          isHex: isValidHex(message),
          parsedTx,
        };
      default:
        return {
          parsedTx: null,
          isHex: false,
        };
    }
  }
}
