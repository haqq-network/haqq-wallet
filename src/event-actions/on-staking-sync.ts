import {app} from '@app/contexts';
import {Events} from '@app/events';
import {StakingMetadata} from '@app/models/staking-metadata';
import {Wallet} from '@app/models/wallet';
import {Cosmos} from '@app/services/cosmos';

export async function onStakingSync() {
  Logger.log('onStakingSync');
  const cosmos = new Cosmos(app.provider!);
  const addressList = Wallet.getAllVisible().map(w =>
    Cosmos.address(w.address),
  );
  await sync(addressList, cosmos);
  app.emit(Events.onWalletsStakingBalanceCheck);
}

async function sync(addressList: string[], cosmos: Cosmos) {
  const rows = StakingMetadata.getAll().snapshot();

  return Promise.all(
    addressList.reduce<Promise<string[]>[]>((memo, curr) => {
      return memo.concat([
        syncStakingDelegations(curr, cosmos),
        syncStakingUnDelegations(curr, cosmos),
        syncStakingRewards(curr, cosmos),
      ]);
    }, []),
  ).then(results => {
    const hashes = new Set(results.flat());
    for (const e of rows) {
      if (e && e.isValid() && !hashes.has(e.hash)) {
        StakingMetadata.remove(e.hash);
      }
    }
  });
}

async function syncStakingDelegations(
  address: string,
  cosmos: Cosmos,
): Promise<string[]> {
  return cosmos
    .getAccountDelegations(address)
    .then(resp =>
      resp.delegation_responses.map(d =>
        StakingMetadata.createDelegation(
          d.delegation.delegator_address,
          d.delegation.validator_address,
          d.balance.amount,
        ),
      ),
    )
    .then(hashes => hashes.filter(Boolean) as string[])
    .catch(() => []);
}

async function syncStakingUnDelegations(
  address: string,
  cosmos: Cosmos,
): Promise<string[]> {
  return cosmos
    .getAccountUnDelegations(address)
    .then(resp => {
      return resp.unbonding_responses
        .map(ur => {
          return ur.entries.map(ure =>
            StakingMetadata.createUnDelegation(
              ur.delegator_address,
              ur.validator_address,
              ure.balance,
              ure.completion_time,
            ),
          );
        })
        .flat();
    })
    .then(hashes => hashes.filter(Boolean) as string[])
    .catch(() => []);
}

async function syncStakingRewards(
  address: string,
  cosmos: Cosmos,
): Promise<string[]> {
  return cosmos
    .getAccountRewardsInfo(address)
    .then(resp => {
      return resp.rewards
        .map(r =>
          r.reward.map(rr =>
            StakingMetadata.createReward(
              address,
              r.validator_address,
              rr.amount,
            ),
          ),
        )
        .flat();
    })
    .then(hashes => hashes.filter(Boolean) as string[])
    .catch(() => []);
}
