import {app} from '@app/contexts';
import {Wallet} from '@app/models/wallet';
import {Cosmos} from '@app/services/cosmos';

export async function onStakingSync() {
  const wallets = Wallet.getAll();

  const cosmos = new Cosmos(app.provider!);
  const addressList = wallets
    .filtered('isHidden != true')
    .map(w => Cosmos.address(w.address));
  await cosmos.sync(addressList);
}
