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

export class TransportHot
  extends ProviderBase<{
    encryptedData: string;
    getPassword: () => Promise<string>;
  }>
  implements ProviderInterface
{
  async getEthAddress(_hdPath: string): Promise<string> {
    const privateKey = await this.decrypt();

    if (!privateKey) {
      throw new Error('private_key_not_found');
    }

    const {address} = await accountInfo(privateKey);
    return address;
  }

  async getPublicKey(_hdPath: string): Promise<string> {
    const privateKey = await this.decrypt();

    if (!privateKey) {
      throw new Error('private_key_not_found');
    }

    const {publicKey} = await accountInfo(privateKey);
    return publicKey;
  }

  async getSignedTx(
    _hdPath: string,
    transaction: TransactionRequest | UnsignedTransaction,
  ) {
    let resp = '';
    try {
      const privateKey = await this.decrypt();

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
      const privateKey = await this.decrypt();

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

  async decrypt() {
    const password = await this._options.getPassword();

    const decrypted = await decrypt<{privateKey: string}>(
      password,
      this._options.encryptedData,
    );
    return decrypted.privateKey;
  }
}
