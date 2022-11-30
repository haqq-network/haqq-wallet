import React, {useCallback, useEffect, useMemo, useRef} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {StyleSheet, TextInput, TouchableWithoutFeedback} from 'react-native';

import {SumBlock} from '@app/components/ui/sum-block';
import {useContacts} from '@app/hooks';
import {useSumAmount} from '@app/hooks/use-sum-amount';
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
  balance: number;
  fee: number;
  to: string;
  from: string;
  onAmount: (amount: number) => void;
  onContact: () => void;
};

export const TransactionSum = ({
  to,
  balance,
  fee,
  onAmount,
  onContact,
}: TransactionSumProps) => {
  const contacts = useContacts();
  const amounts = useSumAmount();

  useEffect(() => {
    amounts.setMaxAmount(balance - 2 * fee);
  }, [amounts, balance, fee]);

  const inputSumRef = useRef<TextInput>(null);

  const contact = useMemo(() => contacts.getContact(to), [contacts, to]);

  const formattedAddress = useMemo(
    () => (contact ? `${contact.name} ${shortAddress(to)}` : shortAddress(to)),
    [contact, to],
  );

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => inputSumRef.current?.focus(), 500);
    }, []),
  );

  const onDone = useCallback(() => {
    onAmount(parseFloat(amounts.amount));
  }, [amounts, onAmount]);

  const onPressMax = useCallback(() => {
    vibrate(HapticEffects.impactLight);
    amounts.setAmount(amounts.maxAmount.toFixed(4));
  }, [amounts]);

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
        value={amounts.amount}
        error={amounts.error}
        currency="ISLM"
        balance={balance}
        onChange={amounts.setAmount}
        onMax={onPressMax}
      />
      <Spacer />
      <Button
        style={page.submit}
        disabled={!amounts.isValid}
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
