import {app} from '@app/contexts';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';

export async function onWalletsStakingBalanceCheck() {
  try {
    const balances = Wallet.getAllVisible().map(w => {
      const metadata = StakingMetadata.getAllByDelegator(
        w.cosmosAddress,
      ).filtered('type != $0', StakingMetadataType.reward);
      const total = metadata.reduce(
        (prev, curr) => prev.add(curr.amountHex),
        Balance.Empty,
      );
      return [w.address, total];
    });

    await app.onWalletsStakingBalance(Object.fromEntries(balances));
  } catch (e) {
    Logger.error('onWalletsStakingBalanceCheck', e);
  }
}
