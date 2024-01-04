import {Events} from '@app/events';
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
      ).filter(({type}) => type !== StakingMetadataType.reward);
      const total = metadata.reduce(
        (prev, curr) => prev.operate(curr.amountHex, 'add'),
        Balance.Empty,
      );
      return [w.address, total];
    });

    Logger.log(
      Events.onWalletsStakingBalanceCheck,
      Object.fromEntries(balances),
    );
    // await app.onWalletsStakingBalance(Object.fromEntries(balances));
  } catch (e) {
    Logger.error(Events.onWalletsStakingBalanceCheck, e);
  }
}
