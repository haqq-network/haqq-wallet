/* eslint-disable react-hooks/exhaustive-deps */
import React, {memo, useCallback, useEffect, useState} from 'react';

import {app} from '@app/contexts';
import {Events} from '@app/events';
import {getUid} from '@app/helpers/get-uid';
import {Wallet} from '@app/models/wallet';
import {Backend} from '@app/services/backend';
import {Raffle} from '@app/types';
import {RafflesWidget} from '@app/widgets/raffles.widget/raffles-widget';

const RafflesWidgetWrapper = memo(() => {
  const [raffles, setRaffles] = useState<Raffle[]>([]);

  const loadRaffles = useCallback(async () => {
    try {
      let uid = await getUid();
      const response = await Backend.instance.contests(
        Wallet.addressList(),
        uid,
      );
      setRaffles(response.sort((a, b) => b.start_at - a.start_at));
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

  return (
    <RafflesWidget
      data={raffles}
      scrollEnabled={false}
      onPressGetTicket={(raffle: Raffle) => {
        raffle;
        return Promise.resolve();
      }}
      onPress={() => {}}
      onPressShowResult={() => {}}
      onCardPress={() => {}}
    />
  );
});

export {RafflesWidgetWrapper};
