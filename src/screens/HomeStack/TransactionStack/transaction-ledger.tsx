import React, {memo, useCallback, useEffect, useRef} from 'react';

import {ProviderInterface} from '@haqq/provider-base';

import {TransactionLedger} from '@app/components/transaction-ledger';
import {app} from '@app/contexts';
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
} from '@app/route-types';
import {EthNetwork} from '@app/services';
import {EventTracker} from '@app/services/event-tracker';
import {MarketingEvents, ModalType} from '@app/types';

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
      if (modal === ModalType.ledgerLocked) {
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
    if (wallet) {
      try {
        await awaitForBluetooth();

        transport.current = await getProviderInstanceForWallet(wallet);

        const ethNetworkProvider = new EthNetwork();
        const calculatedFees = await EthNetwork.estimate('average', {
          from: wallet.address,
          to: route.params.to,
          value: route.params.amount,
        });
        const transaction = await ethNetworkProvider.transferTransaction(
          calculatedFees,
          transport.current!,
          wallet,
          route.params.to,
          route.params.amount,
        );

        if (transaction) {
          EventTracker.instance.trackEvent(MarketingEvents.sendFund);

          navigation.navigate(TransactionStackRoutes.TransactionFinish, {
            transaction,
            hash: transaction.hash,
            token: route.params.token,
          });
        }
      } catch (e) {
        if (e instanceof Error) {
          if (
            e.message === 'can_not_connected' ||
            e.message === 'ledger_locked'
          ) {
            showModal(ModalType.ledgerLocked);
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
