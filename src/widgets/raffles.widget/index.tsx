/* eslint-disable react-hooks/exhaustive-deps */
import React, {memo, useCallback, useEffect, useState} from 'react';

import {app} from '@app/contexts';
import {onEarnGetTicket} from '@app/event-actions/on-earn-get-ticket';
import {Events} from '@app/events';
import {getUid} from '@app/helpers/get-uid';
import {prepareRaffles} from '@app/helpers/prepare-raffles';
import {useTypedNavigation} from '@app/hooks';
import {Wallet} from '@app/models/wallet';
import {Backend} from '@app/services/backend';
import {Raffle, RaffleStatus} from '@app/types';
import {WEI} from '@app/variables/common';
import {RafflesWidget} from '@app/widgets/raffles.widget/raffles-widget';

export const RafflesWidgetWrapper = memo(() => {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const navigation = useTypedNavigation();

  const loadRaffles = useCallback(async () => {
    try {
      let uid = await getUid();
      const response = await Backend.instance.contests(
        Wallet.addressList(),
        uid,
      );
      setRaffles([]);
      setRaffles(prepareRaffles(response));
    } catch (err) {
      Logger.captureException(
        err,
        'RafflesWidgetWrapper.loadRaffles',
        Wallet.addressList(),
      );
    }
  }, []);

  useEffect(() => {
    loadRaffles();

    app.on(Events.onRaffleTicket, loadRaffles);

    return () => {
      app.off(Events.onRaffleTicket, loadRaffles);
    };
  }, []);

  const onPressGetTicket = useCallback(async (raffle: Raffle) => {
    try {
      await onEarnGetTicket(raffle.id);
    } catch (e) {
      Logger.captureException(e, 'onPressGetTicket');
      throw e;
    }
  }, []);

  const onPressShowResult = useCallback(
    (raffle: Raffle) => {
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
          .reduce(
            (prev, curr) =>
              prev +
              (parseInt(curr.budget, 16) / WEI / curr.winners) *
                curr.winner_tickets,
            0,
          ) || 0;

      const prevTicketsCount =
        raffles
          ?.filter?.(it => it.status === RaffleStatus.closed)
          .reduce((prev, curr) => prev + curr.winner_tickets, 0) || 0;

      navigation.navigate('raffleDetails', {
        item: raffle,
        prevIslmCount,
        prevTicketsCount,
      });
    },
    [navigation, raffles],
  );

  return (
    <RafflesWidget
      data={raffles}
      scrollEnabled={false}
      onPressGetTicket={onPressGetTicket}
      onPress={onPressRaffle}
      onPressShowResult={onPressShowResult}
    />
  );
});
