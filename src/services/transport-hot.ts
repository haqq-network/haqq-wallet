import {TransactionRequest} from '@ethersproject/abstract-provider';
import {hexConcat, joinSignature} from '@ethersproject/bytes';
import {keccak256} from '@ethersproject/keccak256';
import {UnsignedTransaction} from '@ethersproject/transactions/src.ts';
import {Wallet as EthersWallet} from '@ethersproject/wallet';

import {app} from '@app/contexts';
import {EthNetwork} from '@app/services/eth-network';
import {Transport} from '@app/services/transport';
import {TransportWallet} from '@app/types';

export class TransportHot extends Transport implements TransportWallet {
  async getPublicKey() {
    const password = await app.getPassword();
    const privateKey = await this._wallet.getPrivateKey(password);

    const ethWallet = new EthersWallet(privateKey, EthNetwork.network);

    return Buffer.from(
      ethWallet._signingKey().compressedPublicKey.slice(2),
      'hex',
    ).toString('base64');
  }

  async getSignedTx(transaction: TransactionRequest | UnsignedTransaction) {
    const password = await app.getPassword();
    const privateKey = await this._wallet.getPrivateKey(password);

    if (!privateKey) {
      throw new Error('private_key_not_found');
    }
    const wallet = new EthersWallet(privateKey, EthNetwork.network);

    return wallet.signTransaction(transaction as TransactionRequest);
  }

  async signTypedData(domainHash: string, valuesHash: string) {
    const password = await app.getPassword();
    const privateKey = await this._wallet.getPrivateKey(password);
    const ethWallet = new EthersWallet(privateKey, EthNetwork.network);
    const concatHash = hexConcat(['0x1901', domainHash, valuesHash]);
    const hash = keccak256(concatHash);
    return joinSignature(ethWallet._signingKey().signDigest(hash));
  }
}
