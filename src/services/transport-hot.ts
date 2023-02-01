import {TransactionRequest} from '@ethersproject/abstract-provider';
import {hexConcat} from '@ethersproject/bytes';
import {serialize} from '@ethersproject/transactions';
import {UnsignedTransaction} from '@ethersproject/transactions/src.ts';
import {decrypt} from '@haqq/encryption-react-native';
import {
  BytesLike,
  Provider as ProviderBase,
  ProviderInterface,
  hexStringToByteArray,
  joinSignature,
  stringToUtf8Bytes,
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

  async signTransaction(
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
        this.catchError(e, 'signTransaction');
      }
    }

    return resp;
  }

  async signPersonalMessage(
    _hdPath: string,
    message: BytesLike | string,
  ): Promise<string> {
    let resp = '';
    try {
      const privateKey = await decryptPrivateKey(
        this._options.encryptedData,
        this._options.getPassword,
      );

      if (!privateKey) {
        throw new Error('private_key_not_found');
      }

      const m = Array.from(
        typeof message === 'string' ? stringToUtf8Bytes(message) : message,
      );

      const hash = Buffer.from(
        [
          25, 69, 116, 104, 101, 114, 101, 117, 109, 32, 83, 105, 103, 110, 101,
          100, 32, 77, 101, 115, 115, 97, 103, 101, 58, 10,
        ].concat(stringToUtf8Bytes(String(m.length)), m),
      ).toString('hex');

      const signature = await sign(privateKey, hash);

      resp = '0x' + joinSignature(signature);

      this.emit('signTransaction', true);
    } catch (e) {
      if (e instanceof Error) {
        this.catchError(e, 'signTransaction');
      }
    }

    return resp;
  }

  async signTypedData(_hdPath: string, domainHash: string, valuesHash: string) {
    let resp = '';
    try {
      const privateKey = await decryptPrivateKey(
        this._options.encryptedData,
        this._options.getPassword,
      );

      if (!privateKey) {
        throw new Error('private_key_not_found');
      }

      const hash = hexConcat(['0x1901', domainHash, valuesHash]);
      const signature = await sign(privateKey, hash);

      resp = '0x' + joinSignature(signature);
      this.emit('signTypedData', true);
    } catch (e) {
      if (e instanceof Error) {
        this.emit('signTypedData', false, e.message);
        throw new Error(e.message);
      }
    }

    return resp;
  }
}
