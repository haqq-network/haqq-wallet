import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  IconButton,
  LabeledBlock,
  Paragraph,
  Swap,
} from '../components/ui';
import {
  BG_2,
  GRAPHIC_GREEN_1,
  TEXT_BASE_1,
  TEXT_BASE_2,
  TEXT_RED_1,
} from '../variables';
import {Spacer} from '../components/spacer';
import {useWallets} from '../contexts/wallets';
import {Container} from '../components/container';
import {useContacts} from '../contexts/contacts';
import {shortAddress} from '../utils';

type TransactionSumScreenProp = CompositeScreenProps<any, any>;
const numbersRegExp = /^[0-9]*\.?[0-9]*$/;
export const TransactionSumScreen = ({
  route,
  navigation,
}: TransactionSumScreenProp) => {
  const contacts = useContacts();
  const wallets = useWallets();
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState('');

  const contact = useMemo(
    () => contacts.getContact(route.params.to),
    [contacts, route.params.to],
  );

  const formattedAddress = useMemo(
    () =>
      contact
        ? `${contact.name} ${route.params.to}`
        : shortAddress(route.params.to),
    [contact, route.params.to],
  );

  useEffect(() => {
    wallets.getBalance(route.params.from).then(result => {
      setBalance(result);
    });
  }, [route.params.from, wallets]);

  const checked = useMemo(
    () =>
      parseFloat(amount) > 0 &&
      balance > 0 &&
      parseFloat(amount) < balance &&
      !error,
    [error, amount, balance],
  );

  const onDone = useCallback(async () => {
    navigation.navigate('transactionConfirmation', {
      from: route.params.from,
      to: route.params.to,
      amount: parseFloat(amount),
    });
  }, [amount, navigation, route.params.from, route.params.to]);

  const onPressMax = useCallback(() => {
    setAmount(balance.toFixed(8));
  }, [balance]);

  const onChangeValue = useCallback(
    (value: string) => {
      setAmount(value);
      setError(() => {
        if (!value.match(numbersRegExp)) {
          return 'Wrong symbol';
        }
        if (parseFloat(value) > balance) {
          return "You don't have enough funds";
        }

        return '';
      });
    },
    [balance],
  );

  const onPressSwap = () => {};

  return (
    <Container>
      <KeyboardAvoidingView style={{flex: 1, justifyContent: 'space-between'}}>
        <LabeledBlock label="Send to" style={{marginBottom: 50}}>
          <Paragraph
            style={{color: TEXT_BASE_1}}
            numberOfLines={1}
            ellipsizeMode="middle">
            {formattedAddress}
          </Paragraph>
        </LabeledBlock>
        <Text style={page.subtitle}>ISLM</Text>
        <View style={page.sum}>
          <View style={page.swap}>
            <IconButton onPress={onPressSwap} style={page.swapButton}>
              <Swap color={GRAPHIC_GREEN_1} />
            </IconButton>
          </View>
          <TextInput
            style={page.input}
            value={amount}
            placeholder="0"
            onChangeText={onChangeValue}
            keyboardType="numeric"
            placeholderTextColor={TEXT_BASE_2}
          />
          <View style={page.max}>
            <Button
              title="Max"
              onPress={onPressMax}
              variant={ButtonVariant.second}
              size={ButtonSize.small}
            />
          </View>
        </View>
        {error ? (
          <Text style={[page.help, page.error]}>{error}</Text>
        ) : (
          <Text style={[page.help, page.available]}>
            Available: {balance.toFixed(8)} ISLM
          </Text>
        )}
        <Spacer />
        <Button
          disabled={!checked}
          variant={ButtonVariant.contained}
          title="Preview"
          onPress={onDone}
        />
      </KeyboardAvoidingView>
    </Container>
  );
};

const page = StyleSheet.create({
  input: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 42,
    color: TEXT_BASE_1,
    paddingVertical: 2,
    alignItems: 'center',
  },
  swap: {
    height: 46,
    width: 60,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  max: {
    height: 46,
    width: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  swapButton: {
    backgroundColor: BG_2,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  subtitle: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    color: TEXT_BASE_2,
    marginBottom: 4,
  },
  sum: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  available: {
    color: TEXT_BASE_2,
  },
  error: {
    color: TEXT_RED_1,
  },
  help: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
});
