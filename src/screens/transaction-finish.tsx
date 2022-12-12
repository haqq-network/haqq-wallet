import React, {useCallback, useEffect, useMemo, useState} from 'react';

import prompt from 'react-native-prompt-android';

import {TransactionFinish} from '@app/components/transaction-finish';
import {
  useContacts,
  useTransactions,
  useTypedNavigation,
  useTypedRoute,
} from '@app/hooks';
import {Transaction} from '@app/models/transaction';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {shortAddress} from '@app/utils';

export const TransactionFinishScreen = () => {
  const {navigate, getParent} = useTypedNavigation();
  const {hash} = useTypedRoute<'transactionFinish'>().params;
  const transactions = useTransactions();
  const [transaction, setTransaction] = useState<Transaction | null>(
    transactions.getTransaction(hash),
  );
  const contacts = useContacts();

  const contact = useMemo(
    () => contacts.getContact(transaction?.to ?? ''),
    [contacts, transaction?.to],
  );
  const short = useMemo(
    () => shortAddress(transaction?.to ?? ''),
    [transaction?.to],
  );

  const onSubmit = () => {
    getParent()?.goBack();
  };

  const onPressContact = useCallback(() => {
    if (transaction?.to) {
      prompt(
        contact ? 'Edit contact' : 'Add contact',
        `Address: ${short}`,
        value => {
          if (contact) {
            contacts.updateContact(transaction.to, value);
          } else {
            contacts.createContact(transaction.to, value);
          }
        },
        {
          defaultValue: contact?.name ?? '',
          placeholder: 'Contact name',
        },
      );
    }
  }, [transaction?.to, contact, short, contacts]);

  useEffect(() => {
    setTransaction(transactions.getTransaction(hash));
    vibrate(HapticEffects.success);
  }, [hash, navigate, transactions]);

  useEffect(() => {
    const notificationsIsEnabled = false;
    if (!notificationsIsEnabled) {
      getParent()?.navigate('notificationPopup');
    }
  }, [getParent]);

  return (
    <TransactionFinish
      onPressContact={onPressContact}
      onSubmit={onSubmit}
      transaction={transaction}
      contact={contact}
      short={short}
    />
  );
};
