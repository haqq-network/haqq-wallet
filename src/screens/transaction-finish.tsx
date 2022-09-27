import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  BlockIcon,
  Button,
  ButtonVariant,
  IconButton,
  InvoiceIcon,
  ISLMIcon,
  PenIcon,
  PopupContainer,
  Spacer,
  Title,
  UserIcon,
} from '../components/ui';
import {
  BG_8,
  GRAPHIC_BASE_2,
  GRAPHIC_GREEN_1,
  TEXT_BASE_1,
  TEXT_BASE_2,
  TEXT_GREEN_1,
} from '../variables';
import {Image, StyleSheet, Text, View} from 'react-native';
import {useTransactions} from '../contexts/transactions';
import {TransactionType} from '../models/transaction';
import {useContacts} from '../contexts/contacts';
import {shortAddress} from '../utils';
import prompt from 'react-native-prompt-android';

type TransactionFinishScreenProp = CompositeScreenProps<any, any>;

const icon = require('../../assets/images/transaction-finish.png');

export const TransactionFinishScreen = ({
  navigation,
  route,
}: TransactionFinishScreenProp) => {
  const contacts = useContacts();
  const transactions = useTransactions();
  const [transaction, setTransaction] = useState<TransactionType | null>(
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
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginVertical: 12,
        }}>
        <Image source={icon} style={{width: 140, height: 140}} />
      </View>
      <Title style={{marginBottom: 34, color: TEXT_GREEN_1}}>
        Sending Completed!
      </Title>
      <ISLMIcon color={GRAPHIC_GREEN_1} style={page.icon} />
      {transaction && (
        <Text style={page.sum}>
          - {(transaction?.value + transaction?.fee).toFixed(8)} ISLM
        </Text>
      )}
      <Text style={page.address}>{short}</Text>
      <Text style={page.fee}>
        Network Fee: {transaction?.fee.toFixed(8)} ISLM
      </Text>
      <Spacer />
      <View style={page.buttons}>
        <IconButton onPress={onPress} style={page.button}>
          <InvoiceIcon color={GRAPHIC_BASE_2} style={page.buttonIcon} />
          <Text style={page.buttonText}>Details</Text>
        </IconButton>
        <IconButton onPress={onPressContact} style={page.button}>
          {contact ? (
            <PenIcon color={GRAPHIC_BASE_2} style={page.buttonIcon} />
          ) : (
            <UserIcon color={GRAPHIC_BASE_2} style={page.buttonIcon} />
          )}
          <Text style={page.buttonText}>
            {contact ? 'Edit Contact' : 'Add Contact'}
          </Text>
        </IconButton>
        <IconButton onPress={onPress} style={page.button}>
          <BlockIcon color={GRAPHIC_BASE_2} style={page.buttonIcon} />
          <Text style={page.buttonText}>Hash</Text>
        </IconButton>
      </View>
      <Button
        style={{marginBottom: 16}}
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
});
