import {Wallet} from '@app/models/wallet';

export class Transport {
  protected _wallet: Wallet;

  constructor(wallet: Wallet) {
    this._wallet = wallet;
  }

  getCosmosAddress() {
    return this._wallet.cosmosAddress;
  }
}
