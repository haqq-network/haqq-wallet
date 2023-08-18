import {app} from '@app/contexts';
import {
  VestingMetadata,
  VestingMetadataType,
} from '@app/models/vesting-metadata';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';

export async function onWalletsVestingBalanceCheck() {
  try {
    const balances = Wallet.getAllVisible().map(w => {
      const locked = VestingMetadata.getAllByAccount(
        w.cosmosAddress,
      )?.filtered?.('type = $0', VestingMetadataType.locked);
      const unvested = VestingMetadata.getAllByAccount(
        w.cosmosAddress,
      )?.filtered?.('type = $0', VestingMetadataType.unvested);
      const vested = VestingMetadata.getAllByAccount(
        w.cosmosAddress,
      )?.filtered?.('type = $0', VestingMetadataType.vested);

      const lockedTotal = locked?.reduce?.(
        (prev, curr) => prev.add(new Balance(curr.amount ?? 0)),
        Balance.Empty,
      );
      const unvestedTotal = unvested?.reduce?.(
        (prev, curr) => prev.add(new Balance(curr.amount ?? 0)),
        Balance.Empty,
      );
      const vestedTotal = vested?.reduce?.(
        (prev, curr) => prev.add(new Balance(curr.amount ?? 0)),
        Balance.Empty,
      );

      const balance = {
        [VestingMetadataType.locked]: lockedTotal,
        [VestingMetadataType.unvested]: unvestedTotal,
        [VestingMetadataType.vested]: vestedTotal,
      };

      return [w.address, balance];
    });

    await app.onWalletsVestingBalance(Object.fromEntries(balances));
  } catch (e) {
    Logger.error('onWalletsVestingBalanceCheck', e);
  }
}
