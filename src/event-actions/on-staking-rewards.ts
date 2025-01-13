import {app} from '@app/contexts';
import {Events} from '@app/events';
import {getProviderInstanceForWallet} from '@app/helpers';
import {getRemoteBalanceValue} from '@app/helpers/get-remote-balance-value';
import {Provider} from '@app/models/provider';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {Wallet} from '@app/models/wallet';
import {Cosmos} from '@app/services/cosmos';
import {AWAIT_NEW_BLOCK_MS} from '@app/variables/common';

export async function onStakingRewards() {
  const cosmos = new Cosmos(Provider.selectedProvider);
  const visible = Wallet.getAllVisible();
  const rewards = StakingMetadata.getAllByType(StakingMetadataType.reward);
  const delegators: any = {};
  const minAmount = getRemoteBalanceValue('transfer_min_amount');

  for (const row of rewards) {
    if (row.amount > minAmount.toFloat()) {
      delegators[row.delegator] = (delegators[row.delegator] ?? []).concat(
        row.validator,
      );
    }
  }

  const exists = visible.filter(w => w.cosmosAddress in delegators);

  const queue = exists.map(async w => {
    const provider = await getProviderInstanceForWallet(w);
    await cosmos.multipleWithdrawDelegatorReward(
      provider,
      w.getPath()!,
      delegators[w.cosmosAddress],
    );

    return [w.cosmosAddress, delegators[w.cosmosAddress]];
  });

  const responses = await Promise.all(
    queue.map(p =>
      p
        .then(value => ({
          status: 'fulfilled',
          value,
        }))
        .catch(reason => ({
          status: 'rejected',
          reason,
          value: null,
        })),
    ),
  );

  for (const resp of responses) {
    if (resp.status === 'fulfilled' && resp.value) {
      for (const reward of rewards) {
        if (
          reward &&
          reward.delegator === resp.value[0] &&
          reward.validator === resp.value[1]
        ) {
          StakingMetadata.remove(reward.hash);
        }
      }
    }
  }

  app.emit(Events.onAppReviewRequest);

  setTimeout(() => {
    app.emit(Events.onStakingSync);
  }, AWAIT_NEW_BLOCK_MS);
}
