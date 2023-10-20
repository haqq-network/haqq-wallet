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
import {shortAddress} from '@app/helpers/short-address';
import {useSumAmount} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {BALANCE_MULTIPLIER, Balance, FEE_AMOUNT} from '@app/services/balance';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {CURRENCY_NAME} from '@app/variables/common';

export type TransactionSumProps = {
  balance: Balance;
  fee: Balance | null;
  to: string;
  from: string;
  contact: Contact | null;
  onAmount: (amount: Balance) => void;
  onContact: () => void;
  testID?: string;
};

export const TransactionSum = ({
  to,
  balance,
  fee,
  contact,
  onAmount,
  onContact,
  testID,
}: TransactionSumProps) => {
  const transactionFee = useMemo(() => {
    return fee !== null
      ? fee.operate(BALANCE_MULTIPLIER, 'mul').max(FEE_AMOUNT)
      : Balance.Empty;
  }, [fee]);

  const amounts = useSumAmount();

  useEffect(() => {
    amounts.setMaxAmount(balance.operate(transactionFee, 'sub'));
  }, [balance, transactionFee]);

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
    onAmount(new Balance(parseFloat(amounts.amount)));
  }, [amounts, onAmount]);

  const onPressMax = useCallback(() => {
    vibrate(HapticEffects.impactLight);
    amounts.setMax();
  }, [amounts]);

  return (
    <KeyboardSafeArea isNumeric style={styles.container} testID={testID}>
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
          currency={CURRENCY_NAME}
          balance={balance}
          onChange={amounts.setAmount}
          onMax={onPressMax}
          testID={`${testID}_form`}
        />
      </Spacer>
      <Spacer minHeight={16} />
      <Button
        disabled={!amounts.isValid}
        variant={ButtonVariant.contained}
        i18n={I18N.transactionSumPreview}
        onPress={onDone}
        testID={`${testID}_next`}
      />
      <Spacer height={16} />
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
    paddingBottom: 16,
  },
});
