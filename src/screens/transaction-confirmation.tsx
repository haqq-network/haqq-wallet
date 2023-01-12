import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {TransactionConfirmation} from '@app/components/transaction-confirmation';
import {
  abortProviderInstanceForWallet,
  getProviderInstanceForWallet,
} from '@app/helpers/provider-instance';
import {
  useTypedNavigation,
  useTypedRoute,
  useUser,
  useWallet,
} from '@app/hooks';
import {Contact} from '@app/models/contact';
import {Transaction} from '@app/models/transaction';
import {EthNetwork} from '@app/services';
import {WalletType} from '@app/types';

export const TransactionConfirmationScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'transactionConfirmation'>();

  const user = useUser();
  const wallet = useWallet(route.params.from);
  const contact = useMemo(
    () => Contact.getById(route.params.to),
    [route.params.to],
  );

  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [fee, setFee] = useState(route.params.fee ?? 0);

  useEffect(() => {
    EthNetwork.estimateTransaction(
      route.params.from,
      route.params.to,
      route.params.amount,
    ).then(result => setFee(result.fee));
  }, [route.params.from, route.params.to, route.params.amount]);

  const onDoneLedgerBt = useCallback(
    () =>
      navigation.navigate('transactionLedger', {
        from: route.params.from,
        to: route.params.to,
        amount: route.params.amount,
        fee: fee,
      }),
    [fee, navigation, route.params.amount, route.params.from, route.params.to],
  );

  const onConfirmTransaction = useCallback(async () => {
    if (wallet) {
      if (wallet.type === WalletType.ledgerBt) {
        onDoneLedgerBt();
        return;
      }

      try {
        setDisabled(true);

        const ethNetworkProvider = new EthNetwork();

        const transaction = await ethNetworkProvider.sendTransaction(
          getProviderInstanceForWallet(wallet),
          route.params.to,
          route.params.amount,
        );

        if (transaction) {
          Transaction.createTransaction(transaction, user.providerId, fee);
          navigation.navigate('transactionFinish', {
            hash: transaction.hash,
          });
        }
      } catch (e) {
        console.log('onDone', e);
        if (e instanceof Error) {
          setError(e.message);
        }
      } finally {
        setDisabled(false);
      }
    }
  }, [
    fee,
    navigation,
    onDoneLedgerBt,
    route.params.amount,
    route.params.to,
    user.providerId,
    wallet,
  ]);

  useEffect(() => {
    return () => {
      wallet && wallet.isValid() && abortProviderInstanceForWallet(wallet);
    };
  }, [wallet]);

  return (
    <TransactionConfirmation
      error={error}
      disabled={disabled}
      contact={contact}
      to={route.params.to}
      amount={route.params.amount}
      fee={fee}
      onConfirmTransaction={onConfirmTransaction}
    />
  );
};
