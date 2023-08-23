import {app} from '@app/contexts';
import {Events} from '@app/events';
import {
  awaitForLedger,
  awaitForPopupClosed,
  getProviderInstanceForWallet,
} from '@app/helpers';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {Wallet} from '@app/models/wallet';
import {Cosmos} from '@app/services/cosmos';
import {WalletType} from '@app/types';
import {MIN_AMOUNT} from '@app/variables/common';

export async function onStakingRewards() {
  const cosmos = new Cosmos(app.provider!);
  const visible = Wallet.getAllVisible();
  const rewards = StakingMetadata.getAllByType(StakingMetadataType.reward);
  const delegators: any = {};

  for (const row of rewards) {
    if (row.amount > MIN_AMOUNT.toNumber()) {
      delegators[row.delegator] = (delegators[row.delegator] ?? []).concat(
        row.validator,
      );
    }
  }

  const exists = visible.filter(
    w => w.isValid() && w.cosmosAddress in delegators,
  );

  const queue = exists
    .filter(w => w.type !== WalletType.ledgerBt)
    .map(async w => {
      const provider = await getProviderInstanceForWallet(w);
      await cosmos.multipleWithdrawDelegatorReward(
        provider,
        w.path!,
        delegators[w.cosmosAddress],
      );
      return [w.cosmosAddress, delegators[w.cosmosAddress]];
    });

  const ledger = exists.filter(w => w.type === WalletType.ledgerBt);

  while (ledger.length) {
    const current = ledger.shift();

    if (current && current.isValid()) {
      const transport = await getProviderInstanceForWallet(current);
      queue.push(
        cosmos
          .multipleWithdrawDelegatorReward(
            transport,
            current.path!,
            delegators[current.cosmosAddress],
          )
          .then(() => [
            current.cosmosAddress,
            delegators[current.cosmosAddress],
          ]),
      );
      try {
        await awaitForLedger(transport);
      } catch (e) {
        if (e === '27010') {
          await awaitForPopupClosed('ledgerLocked');
        }
        transport.abort();
      }
    }
  }

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

  rewards.forEach(r => StakingMetadata.remove(r.hash));
  app.emit(Events.onAppReviewRequest);
}
