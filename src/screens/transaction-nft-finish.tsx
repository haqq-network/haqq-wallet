import React, {useCallback, useEffect, useMemo, useState} from 'react';

import prompt from 'react-native-prompt-android';

import {TransactionNftFinish} from '@app/components/transaction-nft-finish';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Contact, ContactType} from '@app/models/contact';
import {Transaction} from '@app/models/transaction';
import {sendNotification} from '@app/services';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {shortAddress} from '@app/utils';

export const TransactionNftFinishScreen = () => {
  const {navigate, getParent} = useTypedNavigation();
  const {hash, nft} = useTypedRoute<'transactionNftFinish'>().params;
  const [transaction, setTransaction] = useState<Transaction | null>(
    Transaction.getById(hash),
  );

  const [contact, setContact] = useState(
    Contact.getById(transaction?.to ?? ''),
  );

  useEffect(() => {
    if (contact?.account !== transaction?.to) {
      setContact(Contact.getById(transaction?.to ?? ''));
    }
  }, [contact?.account, transaction?.to]);

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
        getText(
          contact
            ? I18N.transactionFinishEditContact
            : I18N.transactionFinishAddContact,
        ),
        getText(I18N.transactionFinishContactMessage, {
          address: transaction?.to,
        }),
        value => {
          if (contact) {
            contact.update({
              name: value,
            });
            sendNotification(I18N.transactionFinishContactUpdated);
          } else {
            Contact.create(transaction.to, {
              name: value,
              type: ContactType.address,
              visible: true,
            });
            sendNotification(I18N.transactionFinishContactAdded);
            setContact(Contact.getById(transaction?.to ?? ''));
          }
        },
        {
          defaultValue: contact?.name ?? '',
          placeholder: getText(I18N.transactionFinishContactMessagePlaceholder),
        },
      );
    }
  }, [transaction?.to, contact]);

  useEffect(() => {
    setTransaction(Transaction.getById(hash));
    vibrate(HapticEffects.success);
  }, [hash, navigate]);

  return (
    <TransactionNftFinish
      item={nft}
      onPressContact={onPressContact}
      onSubmit={onSubmit}
      transaction={transaction}
      contact={contact}
      short={short}
    />
  );
};
