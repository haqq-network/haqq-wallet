import Decimal from 'decimal.js';

import {AddressUtils} from '@app/helpers/address-utils';
import {Provider} from '@app/models/provider';
import {HexNumber, IndexerBalanceItem} from '@app/types';
import {DEFAULT_PROVIDERS} from '@app/variables/common';

export type CosmosBalanceSingle = {
  available: HexNumber;
  availableForStake: HexNumber;
  staked: HexNumber;
  unbonding: HexNumber;
  rewards: HexNumber;
  totalLocked: HexNumber;
  vested: HexNumber;
  stakedVested: HexNumber;
  totalStaked: HexNumber;
  stakedFree: HexNumber;
  locked: HexNumber;
  total: HexNumber;
};

export type CosmosBalances = {
  available: IndexerBalanceItem[];
  availableForStake: IndexerBalanceItem[];
  staked: IndexerBalanceItem[];
  unbonding: IndexerBalanceItem[];
  rewards: IndexerBalanceItem[];
  totalLocked: IndexerBalanceItem[];
  vested: IndexerBalanceItem[];
  stakedVested: IndexerBalanceItem[];
  totalStaked: IndexerBalanceItem[];
  stakedFree: IndexerBalanceItem[];
  locked: IndexerBalanceItem[];
  total: IndexerBalanceItem[];
};

function findISLM(arr: any[]): HexNumber {
  if (!arr) {
    return '0x0';
  }
  let f = arr.find(o => ['ISLM', 'aISLM', 'aLIQUID6'].includes(o.denom));
  return f ? (new Decimal(f.amount).toHex() as HexNumber) : '0x0';
}

async function fetchCosmosBalanceForWallet(
  address: string,
): Promise<CosmosBalanceSingle> {
  if (address.startsWith('0x')) {
    address = AddressUtils.toHaqq(address);
  }

  let available: HexNumber = '0x00',
    availableForStake: HexNumber = '0x00',
    staked: HexNumber = '0x00',
    unbonding: HexNumber = '0x00',
    rewards: HexNumber = '0x00',
    totalLocked: HexNumber = '0x00',
    vested: HexNumber = '0x00',
    stakedVested: HexNumber = '0x00',
    totalStaked: HexNumber = '0x00',
    stakedFree: HexNumber = '0x00',
    locked: HexNumber = '0x00',
    total: HexNumber = '0x00',
    daoLocked: HexNumber = '0x00';

  try {
    const REST_URL = DEFAULT_PROVIDERS.find(
      it => it.id === Provider.selectedProvider.id,
    )?.cosmos_entry_point;

    if (!REST_URL) {
      throw new Error('Cosmos RPC url not found');
    }

    const endpoints = [
      `/cosmos/bank/v1beta1/balances/${address}`,
      `/cosmos/bank/v1beta1/spendable_balances/${address}`,
      `/cosmos/staking/v1beta1/delegations/${address}`,
      `/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`,
      `/cosmos/distribution/v1beta1/delegators/${address}/rewards`,
      `/haqq/vesting/v1/balances/${address}`,
      // `/haqq/dao/v1/balances/${address}`,
    ];
    const [bals, spend, deleg, unb, rew, vest /* dao */] = await Promise.all(
      endpoints.map(e =>
        fetch(REST_URL + e)
          .then(r => r.json())
          .catch(() => ({})),
      ),
    );

    availableForStake = findISLM(bals.balances);

    available = findISLM(spend.balances);

    if (deleg && deleg.delegation_responses) {
      staked = deleg.delegation_responses.reduce(
        // @ts-ignore
        (acc, c) => new Decimal(acc).add(new Decimal(c.balance.amount)).toHex(),
        staked,
      );
    }
    if (unb && unb.unbonding_responses) {
      // @ts-ignore
      unb.unbonding_responses.forEach(u =>
        u.entries.forEach(
          // @ts-ignore
          e =>
            // @ts-ignore
            (unbonding = new Decimal(unbonding)
              .add(new Decimal(e.balance))
              .toHex()),
        ),
      );
    }
    if (rew && rew.total) {
      // @ts-ignore
      const found = rew.total.find(x => x.denom === 'aISLM');
      if (found) {
        rewards = found.amount;
      }
    }
    totalLocked = findISLM(vest.locked);

    // if (dao && dao.balances) {
    //   // @ts-ignore2
    //   dao.balances.forEach(x => {
    //     daoLocked = new Decimal(daoLocked)
    //       .add(new Decimal(x.amount))
    //       .toHex() as HexNumber;
    //   });
    // }

    vested = new Decimal(availableForStake)
      .minus(new Decimal(available))
      .toHex() as HexNumber;

    stakedVested = new Decimal(totalLocked)
      .minus(new Decimal(vested))
      .toHex() as HexNumber;

    totalStaked = new Decimal(staked)
      .plus(new Decimal(unbonding))
      .plus(new Decimal(rewards))
      .toHex() as HexNumber;

    stakedFree = new Decimal(totalStaked)
      .minus(new Decimal(stakedVested))
      .toHex() as HexNumber;

    locked = new Decimal(totalStaked)
      .plus(new Decimal(vested))
      .plus(new Decimal(daoLocked))
      .toHex() as HexNumber;

    total = new Decimal(availableForStake)
      .plus(new Decimal(totalStaked))
      .toHex() as HexNumber;
  } catch (e) {}

  return {
    available,
    availableForStake,
    staked,
    unbonding,
    rewards,
    totalLocked,
    vested,
    stakedVested,
    totalStaked,
    stakedFree,
    locked,
    total,
  };
}

export async function fetchCosmosBalances(
  wallets: string[],
): Promise<CosmosBalances> {
  try {
    const balancesFromRpc = await Promise.all(
      wallets.map(
        async w =>
          [w, await fetchCosmosBalanceForWallet(w)] as [
            string,
            CosmosBalanceSingle,
          ],
      ),
    );

    return balancesFromRpc.reduce(
      (acc, [address, balances]) => {
        acc.available.push([
          AddressUtils.toEth(address),
          Provider.selectedProvider.ethChainId,
          balances.available,
        ] as IndexerBalanceItem);
        acc.availableForStake.push([
          AddressUtils.toEth(address),
          Provider.selectedProvider.ethChainId,
          balances.availableForStake,
        ] as IndexerBalanceItem);
        acc.staked.push([
          AddressUtils.toEth(address),
          Provider.selectedProvider.ethChainId,
          balances.staked,
        ] as IndexerBalanceItem);
        acc.unbonding.push([
          AddressUtils.toEth(address),
          Provider.selectedProvider.ethChainId,
          balances.unbonding,
        ] as IndexerBalanceItem);
        acc.rewards.push([
          AddressUtils.toEth(address),
          Provider.selectedProvider.ethChainId,
          balances.rewards,
        ] as IndexerBalanceItem);
        acc.totalLocked.push([
          AddressUtils.toEth(address),
          Provider.selectedProvider.ethChainId,
          balances.totalLocked,
        ] as IndexerBalanceItem);
        acc.vested.push([
          AddressUtils.toEth(address),
          Provider.selectedProvider.ethChainId,
          balances.vested,
        ] as IndexerBalanceItem);
        acc.stakedVested.push([
          AddressUtils.toEth(address),
          Provider.selectedProvider.ethChainId,
          balances.stakedVested,
        ] as IndexerBalanceItem);
        acc.totalStaked.push([
          AddressUtils.toEth(address),
          Provider.selectedProvider.ethChainId,
          balances.totalStaked,
        ] as IndexerBalanceItem);
        acc.stakedFree.push([
          AddressUtils.toEth(address),
          Provider.selectedProvider.ethChainId,
          balances.stakedFree,
        ] as IndexerBalanceItem);
        acc.locked.push([
          AddressUtils.toEth(address),
          Provider.selectedProvider.ethChainId,
          balances.locked,
        ] as IndexerBalanceItem);
        acc.total.push([
          AddressUtils.toEth(address),
          Provider.selectedProvider.ethChainId,
          balances.total,
        ] as IndexerBalanceItem);
        return acc;
      },
      {
        available: [],
        availableForStake: [],
        staked: [],
        unbonding: [],
        rewards: [],
        totalLocked: [],
        vested: [],
        stakedVested: [],
        totalStaked: [],
        stakedFree: [],
        locked: [],
        total: [],
      } as CosmosBalances,
    );
  } catch (e) {
    return {
      available: [],
      availableForStake: [],
      staked: [],
      unbonding: [],
      rewards: [],
      totalLocked: [],
      vested: [],
      stakedVested: [],
      totalStaked: [],
      stakedFree: [],
      locked: [],
      total: [],
    };
  }
}
