import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {View} from 'react-native';
import prompt from 'react-native-prompt-android';

import {Color} from '@app/colors';
import {
  BlockIcon,
  Button,
  ButtonVariant,
  ISLMIcon,
  IconButton,
  LottieWrap,
  PenIcon,
  PopupContainer,
  Spacer,
  Text,
  UserIcon,
} from '@app/components/ui';
import {createTheme, openURL} from '@app/helpers';
import {
  useContacts,
  useTransactions,
  useTypedNavigation,
  useTypedRoute,
} from '@app/hooks';
import {Transaction} from '@app/models/transaction';
import {EthNetwork} from '@app/services/eth-network';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {shortAddress} from '@app/utils';
import {LIGHT_GRAPHIC_BASE_2, LIGHT_GRAPHIC_GREEN_1} from '@app/variables';

const icon = require('../../assets/animations/transaction-finish.json');

export const TransactionFinishScreen = () => {
  const {navigate, getParent} = useTypedNavigation();
  const {hash} = useTypedRoute<'transactionFinish'>().params;

  const contacts = useContacts();
  const transactions = useTransactions();

  const [transaction, setTransaction] = useState<Transaction | null>(
    transactions.getTransaction(hash),
  );

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

  const short = useMemo(
    () => shortAddress(transaction?.to ?? ''),
    [transaction?.to],
  );

  const contact = useMemo(
    () => contacts.getContact(transaction?.to ?? ''),
    [contacts, transaction?.to],
  );

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

  const onPressHash = async () => {
    const url = `${EthNetwork.explorer}tx/${transaction?.hash}/internal-transactions`;
    await openURL(url);
  };

  const onSubmit = () => {
    getParent()?.goBack();
  };

  return (
    <PopupContainer style={page.container}>
      <View style={page.sub}>
        <LottieWrap source={icon} style={page.image} autoPlay loop={false} />
      </View>
      <Text t4 style={page.title} center color={Color.textGreen1}>
        Sending Completed!
      </Text>
      <ISLMIcon color={LIGHT_GRAPHIC_GREEN_1} style={page.icon} />
      {transaction && (
        <Text t5 center style={page.sum}>
          - {(transaction?.value + transaction?.fee).toFixed(8)} ISLM
        </Text>
      )}
      <Text t14 center style={page.address}>
        {short}
      </Text>
      <Text t15 center color={Color.textBase2}>
        Network Fee: {transaction?.fee.toFixed(8)} ISLM
      </Text>
      <Spacer />
      <View style={page.buttons}>
        <IconButton onPress={onPressContact} style={page.button}>
          {contact ? (
            <PenIcon color={LIGHT_GRAPHIC_BASE_2} style={page.buttonIcon} />
          ) : (
            <UserIcon color={LIGHT_GRAPHIC_BASE_2} style={page.buttonIcon} />
          )}
          <Text clean t15 center color={Color.textBase2}>
            {contact ? 'Edit Contact' : 'Add Contact'}
          </Text>
        </IconButton>
        <IconButton onPress={onPressHash} style={page.button}>
          <BlockIcon color={LIGHT_GRAPHIC_BASE_2} style={page.buttonIcon} />
          <Text t15 center color={Color.textBase2}>
            Hash
          </Text>
        </IconButton>
      </View>
      <Button
        style={page.margin}
        variant={ButtonVariant.contained}
        title="Done"
        onPress={onSubmit}
      />
    </PopupContainer>
  );
};

const page = createTheme({
  container: {
    paddingHorizontal: 20,
  },
  sub: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  image: {width: 140, height: 140},
  title: {
    marginTop: 32,
    marginBottom: 34,
  },
  icon: {marginBottom: 16, alignSelf: 'center'},
  sum: {
    marginBottom: 8,
  },
  address: {
    marginBottom: 4,
  },
  buttons: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: 28,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
    paddingHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: Color.bg8,
    borderRadius: 12,
  },
  buttonIcon: {
    marginBottom: 4,
  },
  margin: {marginBottom: 16},
});
