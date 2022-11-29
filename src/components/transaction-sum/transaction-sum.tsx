import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {StyleSheet, TextInput, TouchableWithoutFeedback} from 'react-native';
import validate from 'validate.js';

import {SumBlock} from '@app/components/ui/sum-block';
import {useContacts} from '@app/hooks';
import {EthNetwork} from '@app/services/eth-network';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {shortAddress} from '@app/utils';
import {LIGHT_TEXT_BASE_1} from '@app/variables';

import {
  Button,
  ButtonVariant,
  KeyboardSafeArea,
  LabeledBlock,
  Spacer,
  Text,
} from '../ui';

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
  // const [amountUsd, setAmountUsd] = useState('0');
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState('');
  const [maxSum, setMaxSum] = useState(0);
  const inputSumRef = useRef<TextInput>(null);

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
    if (amount !== '') {
      setError(
        validate.single(amount, {
          numericality: {
            notValid: 'Invalid number',
            greaterThan: 0.0001,
            lessThanOrEqualTo: maxSum,
            notGreaterThan: 'Should be greater than 0.0001',
            notLessThanOrEqualTo: "You don't have enough funds",
          },
        }),
      );
    }
  }, [amount, maxSum]);

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => inputSumRef.current?.focus(), 500);
    }, []),
  );

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  // useEffect(() => {
  //   setAmountUsd(amount === '' ? '0' : amount);
  // }, [amount]);

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
    vibrate(HapticEffects.impactLight);
    setAmount(maxSum.toFixed(8));
  }, [maxSum]);

  const onChangeValue = useCallback((value: string) => {
    setAmount(value.replace(/,/g, '.').substring(0, 20));
  }, []);

  return (
    <KeyboardSafeArea isNumeric style={page.container}>
      <TouchableWithoutFeedback onPress={onContact}>
        <LabeledBlock label="Send to">
          <Text
            color={LIGHT_TEXT_BASE_1}
            numberOfLines={1}
            ellipsizeMode="middle">
            {formattedAddress}
          </Text>
        </LabeledBlock>
      </TouchableWithoutFeedback>
      <Spacer height={50} />
      <SumBlock
        value={amount}
        error={error}
        currency="ISLM"
        balance={balance}
        onChange={onChangeValue}
        onMax={onPressMax}
      />
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
  submit: {
    marginVertical: 16,
  },
});
