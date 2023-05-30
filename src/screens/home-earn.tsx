import React, {useCallback, useEffect, useState} from 'react';

import {CaptchaType} from '@app/components/captcha';
import {HomeEarn} from '@app/components/home-earn';
import {Loading} from '@app/components/ui';
import {wallets} from '@app/contexts';
import {captureException, getProviderInstanceForWallet} from '@app/helpers';
import {awaitForCaptcha} from '@app/helpers/await-for-captcha';
import {getLeadingAccount} from '@app/helpers/get-leading-account';
import {getUid} from '@app/helpers/get-uid';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {sendNotification} from '@app/services';
import {Backend} from '@app/services/backend';
import {Raffle, RaffleStatus} from '@app/types';
import {WEI} from '@app/variables/common';

export const HomeEarnScreen = () => {
  const navigation = useTypedNavigation();

  const [raffles, setRaffles] = useState<null | Raffle[]>(null);

  const loadRaffles = useCallback(async () => {
    const response = await Backend.instance.contests(
      wallets.getWallets().map(wallet => wallet.address),
      getUid(),
    );
    setRaffles(response);
  }, []);

  useEffect(() => {
    loadRaffles();
  }, [loadRaffles]);

  const onPressStaking = useCallback(() => {
    navigation.navigate('staking');
  }, [navigation]);

  const onPressGetRewards = useCallback(() => {
    console.log('🟢 onPressGetRewards');
  }, []);
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
      rewardAmount={5000}
      showStakingRewards
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
