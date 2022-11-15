import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {useContacts} from '@app/hooks';
import {EthNetwork} from '@app/services/eth-network';
import {cleanNumber, isNumber, shortAddress} from '@app/utils';
import {
  LIGHT_TEXT_BASE_1,
  LIGHT_TEXT_BASE_2,
  LIGHT_TEXT_GREEN_1,
  LIGHT_TEXT_RED_1,
} from '@app/variables';

import {
  Button,
  ButtonSize,
  ButtonVariant,
  KeyboardSafeArea,
  LabeledBlock,
  Spacer,
  Text,
} from './ui';

export type TransactionSumProps = {
  to: string;
  from: string;
  onAmount: (amount: number) => void;
  onContact: () => void;
};

export const TransactionSum = ({
  to,
  from,
  onAmount,
  onContact,
}: TransactionSumProps) => {
  const contacts = useContacts();
  const [amount, setAmount] = useState('');
  const [amountUsd, setAmountUsd] = useState('0');
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState('');
  const [maxSum, setMaxSum] = useState(0);

  const contact = useMemo(() => contacts.getContact(to), [contacts, to]);

  const formattedAddress = useMemo(
    () => (contact ? `${contact.name} ${shortAddress(to)}` : shortAddress(to)),
    [contact, to],
  );

  const getBalance = useCallback(async () => {
    const newBalance = await EthNetwork.getBalance(from);
    setBalance(newBalance);

    const {fee} = await EthNetwork.estimateTransaction(from, to, newBalance);
    setMaxSum(newBalance - fee * 2);
  }, [from, to]);

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  useEffect(() => {
    setAmountUsd(amount === '' ? '0' : amount);
  }, [amount]);

  const checked = useMemo(
    () =>
      parseFloat(amount) > 0 &&
      balance > 0 &&
      parseFloat(amount) < balance &&
      !error,
    [error, amount, balance],
  );

  const onDone = useCallback(() => {
    onAmount(parseFloat(amount));
  }, [amount, onAmount]);

  const onPressMax = useCallback(() => {
    setAmount(maxSum.toFixed(8));
  }, [maxSum]);

  const onChangeValue = useCallback(
    (value: string) => {
      const sum = value.replace(/,/g, '.');
      setAmount(sum);
      setError(() => {
        if (!isNumber(sum)) {
          return 'Wrong symbol';
        }
        if (parseFloat(sum) > balance) {
          return "You don't have enough funds";
        }

        return '';
      });
    },
    [balance],
  );

  // const onPressSwap = () => {};

  return (
    <KeyboardSafeArea style={page.container}>
      <TouchableWithoutFeedback onPress={onContact}>
        <LabeledBlock label="Send to" style={page.label}>
          <Text
            style={{color: LIGHT_TEXT_BASE_1}}
            numberOfLines={1}
            ellipsizeMode="middle">
            {formattedAddress}
          </Text>
        </LabeledBlock>
      </TouchableWithoutFeedback>
      <Text clean style={page.subtitle}>
        ISLM
      </Text>
      <View style={page.sum}>
        <View style={page.swap}>
          {/*<IconButton onPress={onPressSwap} style={page.swapButton}>*/}
          {/*  <SwapVerticalIcon color={GRAPHIC_GREEN_1} />*/}
          {/*</IconButton>*/}
        </View>
        <TextInput
          style={page.input}
          value={amount}
          placeholder="0"
          onChangeText={onChangeValue}
          keyboardType="numeric"
          placeholderTextColor={LIGHT_TEXT_BASE_2}
          autoFocus
          textAlign="left"
        />
        <View style={page.max}>
          {balance > 0 && (
            <Button
              title="Max"
              onPress={onPressMax}
              variant={ButtonVariant.second}
              size={ButtonSize.small}
            />
          )}
        </View>
      </View>
      <View style={page.amount}>
        <Text t15>$ {amountUsd}</Text>
      </View>
      {error ? (
        <Text clean style={[page.help, page.error]}>
          {error}
        </Text>
      ) : (
        <Text clean style={[page.help, page.available]}>
          Available:{' '}
          <Text clean style={{color: LIGHT_TEXT_GREEN_1}}>
            {cleanNumber(balance.toFixed(8))} ISLM
          </Text>
        </Text>
      )}
      <Spacer />
      <Button
        style={page.submit}
        disabled={!checked}
        variant={ButtonVariant.contained}
        title="Preview"
        onPress={onDone}
      />
    </KeyboardSafeArea>
  );
};

const page = StyleSheet.create({
  container: {justifyContent: 'space-between', paddingHorizontal: 20},
  label: {marginBottom: 50},
  input: {
    alignSelf: 'center',
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 42,
    color: LIGHT_TEXT_BASE_1,
    paddingVertical: 2,
    maxWidth: Dimensions.get('window').width - 180,
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
  subtitle: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    color: LIGHT_TEXT_BASE_2,
    marginBottom: 4,
  },
  sum: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  available: {
    color: LIGHT_TEXT_BASE_2,
  },
  error: {
    color: LIGHT_TEXT_RED_1,
  },
  help: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    textAlign: 'center',
  },
  submit: {
    marginVertical: 16,
  },
  // swapButton: {
  //   backgroundColor: BG_2,
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  // },
});
