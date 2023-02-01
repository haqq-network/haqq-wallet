import {TransactionRequest} from '@ethersproject/abstract-provider';
import {hexConcat} from '@ethersproject/bytes';
import {serialize} from '@ethersproject/transactions';
import {UnsignedTransaction} from '@ethersproject/transactions/src.ts';
import {decrypt} from '@haqq/encryption-react-native';
import {
  Provider as ProviderBase,
  ProviderInterface,
  hexStringToByteArray,
} from '@haqq/provider-base';
import {accountInfo, sign} from '@haqq/provider-web3-utils';

async function decryptPrivateKey(
  encryptedData: string,
  getPassword: () => Promise<string>,
) {
  const password = await getPassword();

  const decrypted = await decrypt<{privateKey: string}>(
    password,
    encryptedData,
  );
  return decrypted.privateKey;
}

export class TransportHot
  extends ProviderBase<{
    encryptedData: string;
    getPassword: () => Promise<string>;
  }>
  implements ProviderInterface
{
  async getAccountInfo(_hdPath: string) {
    const privateKey = await decryptPrivateKey(
      this._options.encryptedData,
      this._options.getPassword,
    );

    if (!privateKey) {
      throw new Error('private_key_not_found');
    }

    return accountInfo(privateKey);
  }

  async getSignedTx(
    _hdPath: string,
    transaction: TransactionRequest | UnsignedTransaction,
  ) {
    let resp = '';
    try {
      const privateKey = await decryptPrivateKey(
        this._options.encryptedData,
        this._options.getPassword,
      );

      if (!privateKey) {
        throw new Error('private_key_not_found');
      }

      const signature = await sign(
        privateKey,
        serialize(<UnsignedTransaction>transaction),
      );

      const sig = hexStringToByteArray(signature);

      resp = serialize(<UnsignedTransaction>transaction, sig);
    } catch (e) {
      if (e instanceof Error) {
        this.catchError(e, 'getSignedTx');
      }
    }

    return resp;
  }

  async signTypedData(_hdPath: string, domainHash: string, valuesHash: string) {
    let response = '';
    try {
      const privateKey = await decryptPrivateKey(
        this._options.encryptedData,
        this._options.getPassword,
      );

      if (!privateKey) {
        throw new Error('private_key_not_found');
      }

      const concatHash = hexConcat(['0x1901', domainHash, valuesHash]);
      response = await sign(privateKey, concatHash);
      this.emit('signTypedData', true);
    } catch (e) {
      if (e instanceof Error) {
        this.emit('signTypedData', false, e.message);
        throw new Error(e.message);
      }
    }

    return response;
  }
}
