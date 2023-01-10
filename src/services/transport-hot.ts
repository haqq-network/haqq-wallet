import {TransactionRequest} from '@ethersproject/abstract-provider';
import {hexConcat, joinSignature} from '@ethersproject/bytes';
import {keccak256} from '@ethersproject/keccak256';
import {UnsignedTransaction} from '@ethersproject/transactions/src.ts';
import {Wallet as EthersWallet} from '@ethersproject/wallet';
import {
  Provider as ProviderBase,
  ProviderInterface,
  compressPublicKey,
} from '@haqq/provider-base';

export class TransportHot
  extends ProviderBase<{}>
  implements ProviderInterface
{
  async getBase64PublicKey() {
    if (!this._wallet.publicKey) {
      const privateKey = await this._wallet.getPrivateKey();
      const ethWallet = new EthersWallet(privateKey);
      this._wallet.publicKey = compressPublicKey(ethWallet.publicKey);
    }

    return Buffer.from(this._wallet.publicKey, 'hex').toString('base64');
  }

  async getSignedTx(transaction: TransactionRequest | UnsignedTransaction) {
    const privateKey = await this._wallet.getPrivateKey();

    if (!privateKey) {
      throw new Error('private_key_not_found');
    }

    const wallet = new EthersWallet(privateKey);

    return wallet.signTransaction(transaction as TransactionRequest);
  }

  async signTypedData(domainHash: string, valuesHash: string) {
    try {
      const privateKey = await this._wallet.getPrivateKey();
      const ethWallet = new EthersWallet(privateKey);
      const concatHash = hexConcat(['0x1901', domainHash, valuesHash]);
      const hash = keccak256(concatHash);
      const response = joinSignature(ethWallet._signingKey().signDigest(hash));
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
