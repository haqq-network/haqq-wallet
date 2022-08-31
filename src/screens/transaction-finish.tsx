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
  Title,
} from '../components/ui';
import {Container} from '../components/container';
import {
  BG_8,
  GRAPHIC_BASE_2,
  GRAPHIC_GREEN_1,
  TEXT_BASE_1,
  TEXT_BASE_2,
  TEXT_GREEN_1,
} from '../variables';
import {Spacer} from '../components/spacer';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {useTransactions} from '../contexts/transactions';
import {TransactionType} from '../models/transaction';
import {useContacts} from '../contexts/contacts';
import {shortAddress} from '../models/contact';

type TransactionFinishScreenProp = CompositeScreenProps<any, any>;

export const TransactionFinishScreen = ({
  navigation,
  route,
}: TransactionFinishScreenProp) => {
  const contacts = useContacts();
  const transactions = useTransactions();
  const [transaction, setTransaction] = useState<TransactionType | null>(null);

  useEffect(() => {
    transactions.getTransaction(route.params.hash).then(resp => {
      setTransaction(resp);
    });
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
      Alert.prompt(
        contact ? 'Edit contact' : 'Add contact',
        `Address: ${short}`,
        value => {
          if (contact) {
            contacts.updateContact(transaction.to, value);
          } else {
            contacts.createContact(transaction.to, value);
          }
        },
      );
    }
  }, [transaction?.to, contact, short, contacts]);

  const onPress = () => {};

  return (
    <Container>
      <Spacer style={{justifyContent: 'center'}}>
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
      </Spacer>
      <View style={page.buttons}>
        <IconButton onPress={onPress} style={page.button}>
          <InvoiceIcon color={GRAPHIC_BASE_2} style={page.buttonIcon} />
          <Text style={page.buttonText}>Details</Text>
        </IconButton>
        <IconButton onPress={onPressContact} style={page.button}>
          <PenIcon color={GRAPHIC_BASE_2} style={page.buttonIcon} />
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
    </Container>
  );
};

const page = StyleSheet.create({
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
