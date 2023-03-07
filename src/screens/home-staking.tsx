import React, {useCallback, useEffect, useState} from 'react';

import {HomeStaking} from '@app/components/home-staking';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForPopupClosed} from '@app/helpers';
import {awaitForBluetooth} from '@app/helpers/await-for-bluetooth';
import {awaitForLedger} from '@app/helpers/await-for-ledger';
import {
  abortProviderInstanceForWallet,
  getProviderInstanceForWallet,
} from '@app/helpers/provider-instance';
import {sumReduce} from '@app/helpers/staking';
import {useCosmos, useTypedNavigation, useWalletsList} from '@app/hooks';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {WalletType} from '@app/types';
import {MIN_AMOUNT} from '@app/variables/common';

const initData = {
  stakingSum: 0,
  rewardsSum: 0,
  unDelegationSum: 0,
  loading: true,
};

export const HomeStakingScreen = () => {
  const {visible} = useWalletsList();

  const [data, setData] = useState({
    ...initData,
    availableSum: visible.reduce(
      (acc, w) => acc + app.getBalance(w.address),
      0,
    ),
  });
  const navigation = useTypedNavigation();
  const cosmos = useCosmos();

  const onPressValidators = useCallback(() => {
    navigation.navigate('stakingValidators');
  }, [navigation]);

  useEffect(() => {
    const rows = StakingMetadata.getAll();

    const listener = () => {
      const rewards = rows.filter(
        val => val.type === StakingMetadataType.reward,
      );
      const delegations = rows.filter(
        val => val.type === StakingMetadataType.delegation,
      );
      const unDelegations = rows.filter(
        val => val.type === StakingMetadataType.undelegation,
      );

      const rewardsSum = sumReduce(rewards);
      const stakingSum = sumReduce(delegations);
      const unDelegationSum = sumReduce(unDelegations);
      const availableSum = visible.reduce(
        (acc, w) => acc + app.getBalance(w.address),
        0,
      );

      setData({
        rewardsSum,
        stakingSum,
        unDelegationSum,
        availableSum,
        loading: false,
      });
    };

    rows.addListener(listener);
    app.addListener('balance', listener);
    return () => {
      rows.removeListener(listener);
      app.removeListener('balance', listener);
    };
  }, [visible]);

  const onPressGetRewards = useCallback(async () => {
    const rewards = StakingMetadata.getAllByType(StakingMetadataType.reward);

    const delegators: any = {};

    for (const row of rewards) {
      if (row.amount > MIN_AMOUNT) {
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
          await awaitForBluetooth();
          await awaitForLedger(transport);
        } catch (e) {
          if (e === '27010') {
            await awaitForPopupClosed('ledger-locked');
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
  }, [cosmos, visible]);

  useEffect(() => {
    const sync = () => {
      app.emit(Events.onStakingSync);
    };

    app.emit(Events.onStakingSync);

    const interval = setInterval(sync, 15000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    return () => {
      visible.map(w => abortProviderInstanceForWallet(w));
    };
  }, [visible]);

  return (
    <HomeStaking
      loading={data.loading}
      availableSum={data.availableSum}
      stakingSum={data.stakingSum}
      rewardsSum={data.rewardsSum}
      unDelegationSum={data.unDelegationSum}
      onPressGetRewards={onPressGetRewards}
      onPressValidators={onPressValidators}
    />
  );
};
