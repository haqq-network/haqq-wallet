import React, {memo, useCallback, useEffect, useRef} from 'react';

import {ProviderInterface} from '@haqq/provider-base';
import Decimal from 'decimal.js';

import {TransactionLedger} from '@app/components/transaction-ledger';
import {app} from '@app/contexts';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {Events} from '@app/events';
import {showModal} from '@app/helpers';
import {awaitForBluetooth} from '@app/helpers/await-for-bluetooth';
import {getProviderInstanceForWallet} from '@app/helpers/provider-instance';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {Wallet} from '@app/models/wallet';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/screens/HomeStack/TransactionStack';
import {EthNetwork} from '@app/services';
import {AdjustEvents} from '@app/types';
import {WEI} from '@app/variables/common';

export const TransactionLedgerScreen = memo(() => {
  const transport = useRef<ProviderInterface | null>(null);
  const navigation = useTypedNavigation<TransactionStackParamList>();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  const route = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.TransactionConfirmation
  >();

  useEffect(() => {
    const subscription = (modal: string) => {
      if (modal === 'ledgerLocked') {
        navigation.goBack();
      }
    };

    app.on(Events.onCloseModal, subscription);

    return () => {
      app.off(Events.onCloseModal, subscription);
    };
  });

  const tryToSingTransaction = useCallback(async () => {
    const wallet = Wallet.getById(route.params.from);
    if (wallet && wallet.isValid()) {
      try {
        await awaitForBluetooth();

        transport.current = await getProviderInstanceForWallet(wallet);

        const ethNetworkProvider = new EthNetwork();
        const transaction = await ethNetworkProvider.transferTransaction(
          transport.current!,
          wallet.path!,
          route.params.to,
          new Decimal(route.params.amount).mul(WEI).toFixed(),
        );

        if (transaction) {
          onTrackEvent(AdjustEvents.sendFund);

          navigation.navigate(TransactionStackRoutes.TransactionFinish, {
            hash: transaction.hash,
          });
        }
      } catch (e) {
        if (e instanceof Error) {
          if (
            e.message === 'can_not_connected' ||
            e.message === 'ledger_locked'
          ) {
            showModal('ledgerLocked');
          } else {
            navigation.goBack();
          }
        }
      }
    }
  }, [navigation, route.params.amount, route.params.from, route.params.to]);

  useEffect(() => {
    requestAnimationFrame(async () => {
      await tryToSingTransaction();
    });
    return () => {
      transport.current && transport.current.abort();
    };
  }, [tryToSingTransaction]);

  return (
    <TransactionLedger
      from={route.params.from}
      to={route.params.to}
      amount={route.params.amount}
    />
  );
});
