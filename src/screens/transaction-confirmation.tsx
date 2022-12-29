import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {TransactionConfirmation} from '@app/components/transaction-confirmation';
import {
  useContacts,
  useTypedNavigation,
  useTypedRoute,
  useUser,
  useWallet,
} from '@app/hooks';
import {Transaction} from '@app/models/transaction';
import {EthNetwork} from '@app/services';
import {WalletType} from '@app/types';

export const TransactionConfirmationScreen = () => {
  const navigation = useTypedNavigation();
  const {params} = useTypedRoute<'transactionConfirmation'>();

  const user = useUser();
  const wallet = useWallet(params.from);
  const contacts = useContacts();
  const contact = useMemo(
    () => contacts.getContact(params.to),
    [contacts, params.to],
  );

  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [fee, setFee] = useState(params.fee ?? 0);

  useEffect(() => {
    EthNetwork.estimateTransaction(params.from, params.to, params.amount).then(
      result => setFee(result.fee),
    );
  }, [params.from, params.to, params.amount]);

  const onDoneLedgerBt = useCallback(
    () =>
      navigation.navigate('transactionLedger', {
        from: params.from,
        to: params.to,
        amount: params.amount,
        fee: fee,
      }),
    [fee, navigation, params.amount, params.from, params.to],
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
          wallet.transport,
          params.to,
          params.amount,
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
    params.amount,
    params.to,
    user.providerId,
    wallet,
  ]);

  useEffect(() => {
    return () => {
      wallet?.transportExists && wallet.transport.abort();
    };
  }, [wallet]);

  return (
    <TransactionConfirmation
      error={error}
      disabled={disabled}
      contact={contact}
      to={params.to}
      amount={params.amount}
      fee={fee}
      onConfirmTransaction={onConfirmTransaction}
    />
  );
};
