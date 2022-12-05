import React, {useCallback, useEffect, useMemo, useRef} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {TextInput, TouchableWithoutFeedback} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  KeyboardSafeArea,
  LabeledBlock,
  Spacer,
  SumBlock,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useContacts, useSumAmount} from '@app/hooks';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {shortAddress} from '@app/utils';

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
    amounts.setMax();
  }, [amounts]);

  return (
    <KeyboardSafeArea isNumeric style={styles.container}>
      <TouchableWithoutFeedback onPress={onContact}>
        <LabeledBlock i18nLabel={I18N.transactionSumSend}>
          <Text
            color={Color.textBase1}
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
        style={styles.submit}
        disabled={!amounts.isValid}
        variant={ButtonVariant.contained}
        i18n={I18N.transactionSumPereview}
        onPress={onDone}
      />
    </KeyboardSafeArea>
  );
};

const styles = createTheme({
  container: {justifyContent: 'space-between', paddingHorizontal: 20},
  submit: {
    marginVertical: 16,
  },
});
