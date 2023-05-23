import React, {useCallback, useEffect, useState} from 'react';

import {HAQQ_BACKEND} from '@env';

import {HomeEarn} from '@app/components/home-earn';
import {Loading} from '@app/components/ui';
import {wallets} from '@app/contexts';
import {getProviderInstanceForWallet} from '@app/helpers';
import {awaitForSession} from '@app/helpers/await-for-session';
import {getLeadingAccount} from '@app/helpers/get-leading-account';
import {getUid} from '@app/helpers/get-uid';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {sendNotification} from '@app/services';
import {Raffle} from '@app/types';

export const HomeEarnScreen = () => {
  const navigation = useTypedNavigation();

  console.log(Wallet.getAll().snapshot());

  const [raffles, setRaffles] = useState(null);

  useEffect(() => {
    fetch(`${HAQQ_BACKEND}contests`, {
      method: 'POST',
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        connection: 'keep-alive',
        'content-type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        accounts: wallets.getWallets().map(wallet => wallet.address),
        uid: getUid(),
      }),
    })
      .then(resp => resp.json())
      .then(contests => {
        setRaffles(contests);
      });
  }, []);

  const onPressStaking = useCallback(() => {
    navigation.navigate('staking');
  }, [navigation]);

  const onPressGetRewards = useCallback(() => {
    console.log('🟢 onPressGetRewards');
  }, []);
  const onPressGetTicket = useCallback(async (raffle: Raffle) => {
    const leadingAccount = getLeadingAccount();

    if (!leadingAccount) {
      throw new Error('No leading account');
    }

    const session = await awaitForSession();
    console.log('session', session);
    const uid = getUid();
    const provider = await getProviderInstanceForWallet(leadingAccount);

    const signature = await provider.signPersonalMessage(
      leadingAccount?.path ?? '',
      `${raffle.id}:${uid}:${session}`,
    );

    const resp = await fetch(`${HAQQ_BACKEND}contests/${raffle.id}`, {
      method: 'POST',
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        connection: 'keep-alive',
        'content-type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        ts: Math.floor(Date.now() / 1000),
        uid: uid,
        signature: signature,
        session: session,
      }),
    });

    const res = await resp.json();

    sendNotification(I18N.earnTicketRecieved);
    console.log('🟢 onPressGetTicket', JSON.stringify(res, null, 2));
  }, []);
  const onPressShowResult = useCallback(
    (raffle: Raffle) => {
      console.log('🟢 onPressShowResult', JSON.stringify(raffle, null, 2));
      navigation.navigate('raffleReward', {item: raffle});
    },
    [navigation],
  );
  const onPressRaffle = useCallback(
    (raffle: Raffle) => {
      console.log('🟢 onPressRaffle', JSON.stringify(raffle, null, 2));
      navigation.navigate('raffleDetails', {item: raffle});
    },
    [navigation],
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
