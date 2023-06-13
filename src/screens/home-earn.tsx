import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {CaptchaType} from '@app/components/captcha';
import {HomeEarn} from '@app/components/home-earn';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {
  awaitForPopupClosed,
  captureException,
  getProviderInstanceForWallet,
} from '@app/helpers';
import {awaitForBluetooth} from '@app/helpers/await-for-bluetooth';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {awaitForCaptcha} from '@app/helpers/await-for-captcha';
import {awaitForLedger} from '@app/helpers/await-for-ledger';
import {getLeadingAccount} from '@app/helpers/get-leading-account';
import {getUid} from '@app/helpers/get-uid';
import {sumReduce} from '@app/helpers/staking';
import {useCosmos, useTypedNavigation, useWalletsVisible} from '@app/hooks';
import {I18N} from '@app/i18n';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {Wallet} from '@app/models/wallet';
import {sendNotification} from '@app/services';
import {Backend} from '@app/services/backend';
import {AdjustEvents, Raffle, RaffleStatus} from '@app/types';
import {WalletType} from '@app/types';
import {NUM_PRECISION, WEI} from '@app/variables/common';
import {MIN_AMOUNT} from '@app/variables/common';

const initData = {
  stakingSum: 0,
  rewardsSum: 0,
  unDelegationSum: 0,
  loading: true,
};

export const HomeEarnScreen = () => {
  const navigation = useTypedNavigation();
  const visible = useWalletsVisible();
  const cosmos = useCosmos();
  const [raffles, setRaffles] = useState<null | Raffle[]>(null);

  const [data, setData] = useState({
    ...initData,
    availableSum: visible.reduce(
      (acc, w) => acc + app.getBalance(w.address),
      0,
    ),
  });

  const canGetRewards = useMemo(
    () => data.rewardsSum >= 1 / NUM_PRECISION,
    [data],
  );

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

  const loadRaffles = useCallback(async () => {
    const response = await Backend.instance.contests(
      Wallet.addressList(),
      getUid(),
    );
    setRaffles(response.sort((a, b) => b.start_at - a.start_at));
  }, []);

  useEffect(() => {
    loadRaffles();
  }, [loadRaffles]);

  useEffect(() => {
    onTrackEvent(AdjustEvents.earnOpen);
  }, []);

  const onPressStaking = useCallback(() => {
    navigation.navigate('staking');
  }, [navigation]);

  const onPressGetRewards = useCallback(async () => {
    const rewards = StakingMetadata.getAllByType(StakingMetadataType.reward);
    console.log('rewards', rewards);
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

    console.log('exists', exists);

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

    console.log('queue', queue);

    while (ledger.length) {
      const current = ledger.shift();

      if (current && current.isValid()) {
        const transport = await getProviderInstanceForWallet(current);
        console.log('iter transport', transport);

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

    console.log('responses', responses);

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

  const onPressGetTicket = useCallback(
    async (raffle: Raffle) => {
      const leadingAccount = getLeadingAccount();

      if (!leadingAccount) {
        throw new Error('No leading account');
      }

      const session = await awaitForCaptcha({type: CaptchaType.slider});

      const uid = getUid();
      const provider = await getProviderInstanceForWallet(leadingAccount);

      const signature = await provider.signPersonalMessage(
        leadingAccount?.path ?? '',
        `${raffle.id}:${uid}:${session}`,
      );

      try {
        const res = await Backend.instance.contestParticipate(
          raffle.id,
          uid,
          session,
          signature,
          leadingAccount?.address ?? '',
        );
        sendNotification(I18N.earnTicketRecieved);
        console.log('🟢 onPressGetTicket', JSON.stringify(res, null, 2));
        await loadRaffles();
      } catch (e) {
        captureException(e, 'onPressGetTicket');
      }
    },
    [loadRaffles],
  );
  const onPressShowResult = useCallback(
    (raffle: Raffle) => {
      console.log('🟢 onPressShowResult', JSON.stringify(raffle, null, 2));
      navigation.navigate('raffleReward', {item: raffle});
    },
    [navigation],
  );
  const onPressRaffle = useCallback(
    (raffle: Raffle) => {
      if (raffle.status === 'closed') {
        navigation.navigate('raffleReward', {item: raffle});
        return;
      }

      const prevIslmCount =
        raffles
          ?.filter?.(it => it.status === RaffleStatus.closed)
          .reduce((prev, curr) => prev + parseInt(curr.budget, 16) / WEI, 0) ||
        0;

      const prevTicketsCount =
        raffles
          ?.filter?.(it => it.status === RaffleStatus.closed)
          .reduce((prev, curr) => prev + curr.winner_tickets, 0) || 0;

      console.log('🟢 onPressRaffle', JSON.stringify(raffle, null, 2));
      navigation.navigate('raffleDetails', {
        item: raffle,
        prevIslmCount,
        prevTicketsCount,
      });
    },
    [navigation, raffles],
  );

  if (raffles === null) {
    return <Loading />;
  }

  return (
    <HomeEarn
      rewardAmount={data.rewardsSum}
      showStakingRewards={canGetRewards}
      showStakingGetRewardsButtons
      onPressGetRewards={onPressGetRewards}
      onPressGetTicket={onPressGetTicket}
      onPressShowResult={onPressShowResult}
      onPressStaking={onPressStaking}
      onPressRaffle={onPressRaffle}
      raffleList={raffles}
    />
  );
};
