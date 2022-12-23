import {TransactionRequest} from '@ethersproject/abstract-provider';
import {UnsignedTransaction} from '@ethersproject/transactions/src.ts';
import {ledgerService} from '@ledgerhq/hw-app-eth';
import {utils} from 'ethers';

import {runUntil} from '@app/helpers';
import {Wallet} from '@app/models/wallet';
import {Transport} from '@app/services/transport';
import {compressPublicKey} from '@app/services/transport-utils';
import {TransportWallet} from '@app/types';

export class TransportLedger extends Transport implements TransportWallet {
  public stop: boolean = false;

  constructor(wallet: Wallet) {
    super(wallet);
  }

  async getBase64PublicKey() {
    if (!this._wallet.publicKey) {
      this.stop = false;
      let response = null;

      const iter = runUntil(this._wallet.deviceId!, eth => {
        return eth.getAddress(this._wallet.path);
      });

      let done = false;
      do {
        const resp = await iter.next();
        response = resp.value;
        done = resp.done;
      } while (!done && !this.stop);

      await iter.abort();

      this._wallet.publicKey = compressPublicKey(response.publicKey);
    }

    return Buffer.from(this._wallet.publicKey, 'hex').toString('base64');
  }

  async getSignedTx(transaction: UnsignedTransaction | TransactionRequest) {
    this.stop = false;
    const unsignedTx = utils
      .serializeTransaction(transaction as UnsignedTransaction)
      .substring(2);
    const resolution = await ledgerService.resolveTransaction(
      unsignedTx,
      {},
      {},
    );

    let signature = null;

    const iter = runUntil(this._wallet.deviceId!, eth =>
      eth.signTransaction(this._wallet.path, unsignedTx, resolution),
    );

    let done = false;
    do {
      const resp = await iter.next();
      signature = resp.value;
      done = resp.done;
    } while (!done && !this.stop);

    await iter.abort();

    if (!signature) {
      throw new Error('can_not_connected');
    }

    return utils.serializeTransaction(transaction as UnsignedTransaction, {
      ...signature,
      r: '0x' + signature.r,
      s: '0x' + signature.s,
      v: parseInt(signature.v, 10),
    });
  }

  async signTypedData(domainHash: string, valuesHash: string) {
    this.stop = false;
    let signature = null;
    const iter = runUntil(this._wallet.deviceId!, eth =>
      eth.signEIP712HashedMessage(this._wallet.path, domainHash, valuesHash),
    );

    let done = false;
    do {
      const resp = await iter.next();
      signature = resp.value;
      done = resp.done;
    } while (!done && !this.stop);

    await iter.abort();

    if (!signature) {
      throw new Error('can_not_connected');
    }

    const v = (signature.v - 27).toString(16).padStart(2, '0');
    return '0x' + signature.r + signature.s + v;
  }

  abort() {
    this.stop = true;
  }
}
