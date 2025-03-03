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
import {Wallet} from '@app/models/wallet';
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
  const {hash, transaction, to, token, amount, hideContact, fee} =
    useTypedRoute<
      TransactionStackParamList,
      TransactionStackRoutes.TransactionFinish
    >().params;
  const toAddress = useMemo(
    () => to ?? transaction?.to ?? '',
    [to, transaction?.to],
  );
  const contact = Contact.getById(toAddress);

  const short = useMemo(() => shortAddress(toAddress), [toAddress]);

  const onSubmit = useCallback(async () => {
    await awaitForEventDone(Events.onAppReviewRequest);
    navigate(HomeFeedStackRoutes.HomeFeed);
  }, [getParent]);

  const onPressContact = useCallback(() => {
    if (toAddress) {
      prompt(
        getText(
          contact
            ? I18N.transactionFinishEditContact
            : I18N.transactionFinishAddContact,
        ),
        getText(I18N.transactionFinishContactMessage, {
          address: toAddress,
        }),
        value => {
          if (contact) {
            Contact.update(contact.account, {
              name: value,
            });
            sendNotification(I18N.transactionFinishContactUpdated);
          } else {
            Contact.create(toAddress, {
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
  }, [toAddress, contact]);

  useEffect(() => {
    Wallet.fetchBalances();
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
      fee={fee}
      hideContact={hideContact}
    />
  );
});
