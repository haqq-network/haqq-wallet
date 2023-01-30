import {TransactionRequest} from '@ethersproject/abstract-provider';
import {hexConcat} from '@ethersproject/bytes';
import {serialize} from '@ethersproject/transactions';
import {UnsignedTransaction} from '@ethersproject/transactions/src.ts';
import {
  Provider as ProviderBase,
  ProviderInterface,
  compressPublicKey,
} from '@haqq/provider-base';
import {accountInfo, sign} from '@haqq/provider-web3-utils';

const hexStringToByteArray = (hexString: string | number[]) => {
  if (Array.isArray(hexString)) {
    return hexString;
  }
  return Array.from({length: hexString.length / 2}).map((_, i) =>
    parseInt(hexString.substring(i * 2, (i + 1) * 2), 16),
  );
};

export class TransportHot
  extends ProviderBase<{}>
  implements ProviderInterface
{
  async getBase64PublicKey() {
    const privateKey = await this._wallet.getPrivateKey();

    if (!privateKey) {
      throw new Error('private_key_not_found');
    }

    const {publicKey} = await accountInfo(privateKey);

    let pk = publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey;

    pk = pk.startsWith('04') ? compressPublicKey(pk) : pk;

    return Buffer.from(pk, 'hex').toString('base64');
  }

  async getSignedTx(transaction: TransactionRequest | UnsignedTransaction) {
    const privateKey = await this._wallet.getPrivateKey();

    if (!privateKey) {
      throw new Error('private_key_not_found');
    }

    const signature = await sign(
      privateKey,
      serialize(<UnsignedTransaction>transaction),
    );

    const sig = hexStringToByteArray(signature);

    return serialize(<UnsignedTransaction>transaction, sig);
  }

  async signTypedData(domainHash: string, valuesHash: string) {
    try {
      const privateKey = await this._wallet.getPrivateKey();

      if (!privateKey) {
        throw new Error('private_key_not_found');
      }

      const concatHash = hexConcat(['0x1901', domainHash, valuesHash]);
      const response = await sign(privateKey, concatHash);
      this.emit('signTypedData', true);
      return response;
    } catch (e) {
      if (e instanceof Error) {
        this.emit('signTypedData', false, e.message);
        throw new Error(e.message);
      }
      return '';
    }
  }
}
