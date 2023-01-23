import {TransactionRequest} from '@ethersproject/abstract-provider';
import {hexConcat} from '@ethersproject/bytes';
import {serialize} from '@ethersproject/transactions';
import {UnsignedTransaction} from '@ethersproject/transactions/src.ts';
import {Provider as ProviderBase, ProviderInterface} from '@haqq/provider-base';

import {restoreFromPrivateKey, sign} from '@app/services/eth-utils';

export class TransportHot
  extends ProviderBase<{}>
  implements ProviderInterface
{
  async getBase64PublicKey() {
    if (!this._wallet.publicKey) {
      const privateKey = await this._wallet.getPrivateKey();

      if (!privateKey) {
        throw new Error('private_key_not_found');
      }

      const ethWallet = await restoreFromPrivateKey(privateKey);
      this._wallet.publicKey = ethWallet.publicKey;
    }

    return Buffer.from(this._wallet.publicKey, 'hex').toString('base64');
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

    console.log('signature', signature);

    return serialize(<UnsignedTransaction>transaction, signature);
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
