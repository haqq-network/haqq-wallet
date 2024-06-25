import React, {useCallback, useEffect, useMemo, useRef} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {TextInput, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  KeyboardSafeArea,
  LabeledBlock,
  Spacer,
  SumBlock,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {shortAddress} from '@app/helpers/short-address';
import {useSumAmount} from '@app/hooks';
import {useKeyboard} from '@app/hooks/use-keyboard';
import {I18N} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {Balance} from '@app/services/balance';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {IToken} from '@app/types';
import {BALANCE_MULTIPLIER, FEE_AMOUNT} from '@app/variables/balance';
import {CURRENCY_NAME} from '@app/variables/common';

import {ImageWrapper} from '../image-wrapper';

export type TransactionSumProps = {
  balance: Balance;
  fee: Balance | null;
  to: string;
  from: string;
  contact: Contact | null;
  onAmount: (amount: Balance) => void;
  onContact: () => void;
  onToken: () => void;
  testID?: string;
  token: IToken;
  isLoading: boolean;
};

export const TransactionSum = ({
  to,
  balance,
  fee,
  contact,
  onAmount,
  onContact,
  onToken,
  testID,
  token,
  isLoading,
}: TransactionSumProps) => {
  const {keyboardShown} = useKeyboard();
  const transactionFee = useMemo(() => {
    return fee !== null
      ? fee.operate(BALANCE_MULTIPLIER, 'mul').max(FEE_AMOUNT)
      : Balance.Empty;
  }, [fee]);

  const amounts = useSumAmount(undefined, undefined, undefined);

  useEffect(() => {
    if (token.symbol === CURRENCY_NAME) {
      amounts.setMaxAmount(balance.operate(transactionFee, 'sub'));
    } else {
      amounts.setMaxAmount(token.value);
    }
  }, [balance, transactionFee]);

  const inputSumRef = useRef<TextInput>(null);

  const formattedAddress = useMemo(
    () => (contact ? `${contact.name} ${shortAddress(to)}` : to),
    [contact, to],
  );

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => inputSumRef.current?.focus(), 500);
    }, []),
  );

  const onDone = useCallback(() => {
    onAmount(
      new Balance(
        parseFloat(amounts.amount),
        undefined,
        token.symbol ?? undefined,
      ),
    );
  }, [amounts, onAmount]);

  const onPressMax = useCallback(() => {
    vibrate(HapticEffects.impactLight);
    amounts.setMax();
  }, [amounts]);

  return (
    <KeyboardSafeArea isNumeric style={styles.container} testID={testID}>
      <View style={styles.row}>
        <LabeledBlock
          onPress={onContact}
          i18nLabel={I18N.transactionSumSend}
          style={styles.sumblock}>
          <Text
            variant={TextVariant.t11}
            color={Color.textBase1}
            numberOfLines={1}
            ellipsizeMode="middle">
            {formattedAddress}
          </Text>
        </LabeledBlock>
        <LabeledBlock
          i18nLabel={I18N.transactionCrypto}
          style={styles.cryptoBlock}
          onPress={onToken}>
          <View style={styles.cryptoBlockWrapper}>
            {!!token.image && (
              <ImageWrapper
                style={styles.cryptoBlockImage}
                source={token.image}
              />
            )}
            <Text
              style={styles.cryptoBlockTitle}
              variant={TextVariant.t11}
              color={Color.textBase1}
              numberOfLines={1}
              ellipsizeMode="middle">
              {token.symbol}
            </Text>
          </View>
        </LabeledBlock>
      </View>
      <Spacer centered>
        <SumBlock
          value={amounts.amount}
          error={amounts.error}
          currency={token.symbol || ''}
          balance={token.value}
          onChange={amounts.setAmount}
          onMax={onPressMax}
          testID={`${testID}_form`}
        />
      </Spacer>
      {/* <Button
        variant={ButtonVariant.light}
        size={ButtonSize.small}
        i18n={I18N.transactionSumPreview}
        onPress={() => console.log('open fee screen')}
        testID={`${testID}_enter_fee`}
      /> */}
      <Spacer minHeight={16} />
      <Button
        loading={isLoading}
        disabled={!amounts.isValid || isLoading}
        variant={ButtonVariant.contained}
        i18n={I18N.transactionSumPreview}
        onPress={onDone}
        testID={`${testID}_next`}
      />
      <Spacer height={keyboardShown ? 26 : 16} />
    </KeyboardSafeArea>
  );
};

const styles = createTheme({
  row: {flexDirection: 'row'},
  cryptoBlockImage: {
    maxHeight: 12,
    maxWidth: 12,
    width: 12,
    height: 12,
    borderRadius: 5,
    overflow: 'hidden',
    alignSelf: 'center',
    marginRight: 4,
  },
  cryptoBlockTitle: {
    marginRight: 8,
  },
  cryptoBlockWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cryptoBlock: {
    flex: 1,
    alignItems: 'center',
  },
  sumblock: {
    flex: 3,
    paddingBottom: 8,
    marginRight: 8,
  },
  container: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
});
