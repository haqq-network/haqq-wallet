import React, {useCallback, useEffect, useMemo} from 'react';

import {observer} from 'mobx-react';
import prompt from 'react-native-prompt-android';

import {TransactionFinish} from '@app/components/transaction-finish';
import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {shortAddress} from '@app/helpers/short-address';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {I18N, getText} from '@app/i18n';
import {Contact, ContactType} from '@app/models/contact';
import {Fee} from '@app/models/fee';
import {
  HomeFeedStackRoutes,
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {sendNotification} from '@app/services';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const TransactionFinishScreen = observer(() => {
  const {navigate, getParent, goBack} =
    useTypedNavigation<TransactionStackParamList>();
  useAndroidBackHandler(() => {
    goBack();
    return true;
  }, [goBack]);
  const {hash, transaction, token, amount} = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.TransactionFinish
  >().params;
  Logger.log('TransactionFinishScreen', {hash, transaction, token, amount});
  const contact = Contact.getById(transaction?.to ?? '');

  const short = useMemo(
    () => shortAddress(transaction?.to ?? ''),
    [transaction?.to],
  );

  const onSubmit = useCallback(async () => {
    await awaitForEventDone(Events.onAppReviewRequest);
    Fee.clear();
    navigate(HomeFeedStackRoutes.HomeFeed);
  }, [getParent]);

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
            Contact.update(contact.account, {
              name: value,
            });
            sendNotification(I18N.transactionFinishContactUpdated);
          } else {
            Contact.create(transaction.to!, {
              name: value,
              type: ContactType.address,
              visible: true,
            });
            sendNotification(I18N.transactionFinishContactAdded);
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
    vibrate(HapticEffects.success);
  }, [hash, navigate]);

  return (
    <TransactionFinish
      onPressContact={onPressContact}
      onSubmit={onSubmit}
      transaction={transaction}
      contact={contact}
      short={short}
      testID="transaction_finish"
      token={token}
      amount={amount}
    />
  );
});
