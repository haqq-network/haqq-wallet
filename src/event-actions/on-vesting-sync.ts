import {app} from '@app/contexts';
import {Events} from '@app/events';
import {
  VestingMetadata,
  VestingMetadataType,
} from '@app/models/vesting-metadata';
import {Wallet} from '@app/models/wallet';
import {Cosmos} from '@app/services/cosmos';

export async function onVestingSync() {
  Logger.log('onVestingSync');
  const cosmos = new Cosmos(app.provider!);
  const addressList = Wallet.getAllVisible().map(w =>
    Cosmos.addressToBech32(w.address),
  );
  await sync(addressList, cosmos);
  app.emit(Events.onWalletsVestingBalanceCheck);
}

async function sync(addressList: string[], cosmos: Cosmos) {
  const rows = VestingMetadata.getAll().snapshot();

  return Promise.all(
    addressList.reduce<Promise<string[]>[]>((memo, curr) => {
      return memo.concat(syncVesting(curr, cosmos));
    }, []),
  ).then(results => {
    const hashes = new Set(results.flat());
    for (const e of rows) {
      if (e && e.isValid() && !hashes.has(e.hash)) {
        VestingMetadata.remove(e.hash);
      }
    }
  });
}

async function syncVesting(address: string, cosmos: Cosmos): Promise<string[]> {
  return cosmos
    .getVestingBalances(address)
    .then(resp => {
      return [
        resp.vested.map(d =>
          VestingMetadata.create(address, VestingMetadataType.vested, d.amount),
        ),
        resp.locked.map(d =>
          VestingMetadata.create(address, VestingMetadataType.locked, d.amount),
        ),
        resp.unvested.map(d =>
          VestingMetadata.create(
            address,
            VestingMetadataType.unvested,
            d.amount,
          ),
        ),
      ].flat();
    })
    .then(hashes => hashes.filter(Boolean) as string[])
    .catch(() => []);
}
