import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {TransactionConfirmation} from '@app/components/transaction-confirmation';
import {captureException} from '@app/helpers';
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
import {I18N, getText} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {Transaction} from '@app/models/transaction';
import {EthNetwork} from '@app/services';
import {WalletType} from '@app/types';
import {makeID} from '@app/utils';

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

        const provider = await getProviderInstanceForWallet(wallet);

        const transaction = await ethNetworkProvider.sendTransaction(
          provider,
          wallet.path!,
          route.params.to,
          route.params.amount,
        );

        if (transaction) {
          Transaction.create(transaction, user.providerId, fee);
          navigation.navigate('transactionFinish', {
            hash: transaction.hash,
          });
        }
      } catch (e) {
        const errorId = makeID(4);

        captureException(e, 'transaction-confirmation', {
          from: route.params.from,
          to: route.params.to,
          amount: route.params.amount,
          id: errorId,
        });

        if (e instanceof Error) {
          setError(
            getText(I18N.transactionFailed, {
              id: errorId,
            }),
          );
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
    route.params.from,
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
      disabled={disabled}
      contact={contact}
      to={route.params.to}
      amount={route.params.amount}
      fee={fee}
      onConfirmTransaction={onConfirmTransaction}
      error={error}
    />
  );
};
