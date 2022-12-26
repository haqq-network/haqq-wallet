import {Wallet} from '@app/models/wallet';

export class Transport {
  protected _wallet: Wallet;

  constructor(wallet: Wallet) {
    this._wallet = wallet;
  }

  getEthAddress() {
    return this._wallet.address;
  }

  getCosmosAddress() {
    return this._wallet.cosmosAddress;
  }

  abort() {}
}
