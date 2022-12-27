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
import {useSumAmount} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {shortAddress} from '@app/utils';

export type TransactionSumProps = {
  balance: number;
  fee: number;
  to: string;
  from: string;
  contact: Contact | null;
  onAmount: (amount: number) => void;
  onContact: () => void;
};

export const TransactionSum = ({
  to,
  balance,
  fee,
  contact,
  onAmount,
  onContact,
}: TransactionSumProps) => {
  const amounts = useSumAmount();

  useEffect(() => {
    amounts.setMaxAmount(balance - Math.max(2 * fee, 0.00001));
  }, [amounts, balance, fee]);

  const inputSumRef = useRef<TextInput>(null);

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
        <LabeledBlock
          i18nLabel={I18N.transactionSumSend}
          style={styles.sumblock}>
          <Text
            t11
            color={Color.textBase1}
            numberOfLines={1}
            ellipsizeMode="middle">
            {formattedAddress}
          </Text>
        </LabeledBlock>
      </TouchableWithoutFeedback>
      <Spacer centered>
        <SumBlock
          value={amounts.amount}
          error={amounts.error}
          currency="ISLM"
          balance={balance}
          onChange={amounts.setAmount}
          onMax={onPressMax}
        />
      </Spacer>
      <Spacer minHeight={16} />
      <Button
        disabled={!amounts.isValid}
        variant={ButtonVariant.contained}
        i18n={I18N.transactionSumPereview}
        onPress={onDone}
      />
      <Spacer height={32} />
    </KeyboardSafeArea>
  );
};

const styles = createTheme({
  sumblock: {
    paddingBottom: 8,
  },
  container: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
});
