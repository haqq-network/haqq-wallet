import {Wallet} from '@app/models/wallet';
import {Cosmos} from '@app/services/cosmos';

export class Transport {
  protected _wallet: Wallet;

  constructor(wallet: Wallet) {
    this._wallet = wallet;
  }

  get cosmosAddress() {
    return Cosmos.address(this._wallet.address);
  }
}
