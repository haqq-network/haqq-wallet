import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {
  BlockIcon,
  Button,
  ButtonVariant,
  IconButton,
  InvoiceIcon,
  ISLMIcon,
  Text,
  PenIcon,
  PopupContainer,
  Spacer,
  UserIcon,
  LottieWrap,
} from '../components/ui';
import {
  BG_8,
  GRAPHIC_BASE_2,
  GRAPHIC_GREEN_1,
  TEXT_BASE_1,
  TEXT_BASE_2,
  TEXT_GREEN_1,
} from '../variables';
import {useTransactions} from '../contexts/transactions';
import {Transaction} from '../models/transaction';
import {useContacts} from '../contexts/contacts';
import {shortAddress} from '../utils';
import prompt from 'react-native-prompt-android';

const icon = require('../../assets/animations/transaction-finish.json');

export const TransactionFinishScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'transactionFinish'>>();
  const contacts = useContacts();
  const transactions = useTransactions();
  const [transaction, setTransaction] = useState<Transaction | null>(
    transactions.getTransaction(route.params.hash),
  );

  useEffect(() => {
    setTransaction(transactions.getTransaction(route.params.hash));
  }, [route.params.hash, transactions]);

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

  const onPress = () => {};

  return (
    <PopupContainer style={page.container}>
      <View style={page.sub}>
        <LottieWrap source={icon} style={page.image} autoPlay loop={false} />
      </View>
      <Text t4 style={page.title}>
        Sending Completed!
      </Text>
      <ISLMIcon color={GRAPHIC_GREEN_1} style={page.icon} />
      {transaction && (
        <Text clean style={page.sum}>
          - {(transaction?.value + transaction?.fee).toFixed(8)} ISLM
        </Text>
      )}
      <Text clean style={page.address}>
        {short}
      </Text>
      <Text clean style={page.fee}>
        Network Fee: {transaction?.fee.toFixed(8)} ISLM
      </Text>
      <Spacer />
      <View style={page.buttons}>
        <IconButton onPress={onPress} style={page.button}>
          <InvoiceIcon color={GRAPHIC_BASE_2} style={page.buttonIcon} />
          <Text clean style={page.buttonText}>
            Details
          </Text>
        </IconButton>
        <IconButton onPress={onPressContact} style={page.button}>
          {contact ? (
            <PenIcon color={GRAPHIC_BASE_2} style={page.buttonIcon} />
          ) : (
            <UserIcon color={GRAPHIC_BASE_2} style={page.buttonIcon} />
          )}
          <Text clean style={page.buttonText}>
            {contact ? 'Edit Contact' : 'Add Contact'}
          </Text>
        </IconButton>
        <IconButton onPress={onPress} style={page.button}>
          <BlockIcon color={GRAPHIC_BASE_2} style={page.buttonIcon} />
          <Text clean style={page.buttonText}>
            Hash
          </Text>
        </IconButton>
      </View>
      <Button
        style={page.margin}
        variant={ButtonVariant.contained}
        title="Done"
        onPress={() => {
          navigation.getParent()?.goBack();
        }}
      />
    </PopupContainer>
  );
};

const page = StyleSheet.create({
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
    color: TEXT_GREEN_1,
    textAlign: 'center',
  },
  icon: {marginBottom: 16, alignSelf: 'center'},
  sum: {
    marginBottom: 8,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'center',
    color: TEXT_BASE_1,
  },
  address: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
    color: TEXT_BASE_1,
    marginBottom: 4,
  },
  fee: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: TEXT_BASE_2,
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
    backgroundColor: BG_8,
    borderRadius: 12,
  },
  buttonIcon: {
    marginBottom: 4,
  },
  buttonText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: TEXT_BASE_2,
  },
  margin: {marginBottom: 16},
});
