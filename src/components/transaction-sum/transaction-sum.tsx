import React, {useCallback, useEffect, useMemo, useRef} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {observer} from 'mobx-react';
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
import {Provider} from '@app/models/provider';
import {Balance} from '@app/services/balance';
import {IToken} from '@app/types';
import {BALANCE_MULTIPLIER, FEE_AMOUNT} from '@app/variables/balance';

import {ImageWrapper} from '../image-wrapper';

export type TransactionSumProps = {
  balance: Balance;
  fee: Balance | null;
  to: string;
  from: string;
  contact: Contact | null;
  onPressPreview: (amount: Balance) => void;
  onContact: () => void;
  onToken: () => void;
  onNetworkPress: () => void;
  testID?: string;
  token: IToken;
  isLoading: boolean;
};

const START_AMOUNT = new Balance(0, 0);

export const TransactionSum = observer(
  ({
    to,
    balance,
    fee,
    contact,
    onPressPreview,
    onContact,
    onToken,
    onNetworkPress,
    testID,
    token,
    isLoading,
  }: TransactionSumProps) => {
    const {keyboardShown} = useKeyboard();
    const transactionFee = useMemo(() => {
      return fee !== null
        ? fee
            .operate(new Balance(BALANCE_MULTIPLIER, 0), 'mul')
            .max(new Balance(FEE_AMOUNT))
        : Balance.Empty;
    }, [fee]);

    const minAmount = useMemo(() => {
      // for network native coin
      if (token.symbol === Provider.selectedProvider.denom) {
        return new Balance(0.0000001, 0);
      }

      // for others tokens
      return new Balance(
        Number(`0.${'0'.repeat(token.decimals! - 1)}1`),
        token.decimals!,
        token.symbol!,
      );
    }, [token, Provider.selectedProvider.denom]);

    const maxAmount = useMemo(() => {
      // for network native coin
      if (token.symbol === Provider.selectedProvider.denom) {
        return balance.operate(transactionFee, 'sub');
      }

      // for others tokens
      return new Balance(token.value.raw, token.decimals!, token.symbol!);
    }, [token, balance, transactionFee, Provider.selectedProvider.denom]);

    const amounts = useSumAmount(START_AMOUNT, maxAmount, minAmount);

    useEffect(() => {
      amounts.setMaxAmount(maxAmount);
    }, [maxAmount]);

    const inputSumRef = useRef<TextInput>(null);

    const formattedAddress = useMemo(
      () => (contact?.name ? `${contact.name}` : shortAddress(to, '•', true)),
      [contact, to],
    );

    const onDone = useCallback(() => {
      onPressPreview(amounts.amountBalance);
    }, [amounts, onPressPreview]);

    const onPressMax = useCallback(() => {
      amounts.setMax();
    }, [amounts]);

    useFocusEffect(
      useCallback(() => {
        setTimeout(() => inputSumRef.current?.focus(), 500);
      }, []),
    );

    return (
      <KeyboardSafeArea isNumeric style={styles.container} testID={testID}>
        <View style={styles.row}>
          <LabeledBlock
            onPress={onContact}
            i18nLabel={I18N.transactionSumSend}
            style={styles.labeledBlock}>
            <Text
              variant={TextVariant.t11}
              color={Color.textBase1}
              numberOfLines={2}
              ellipsizeMode="tail">
              {formattedAddress}
            </Text>
          </LabeledBlock>
          <Spacer width={8} />
          <LabeledBlock
            i18nLabel={I18N.transactionCrypto}
            style={styles.labeledBlock}
            onPress={onToken}>
            <View style={styles.cryptoBlockWrapper}>
              {!!token.image && (
                <ImageWrapper
                  style={styles.cryptoBlockImage}
                  source={token.image}
                />
              )}
              <Text
                variant={TextVariant.t11}
                color={Color.textBase1}
                numberOfLines={1}
                ellipsizeMode="middle">
                {token.symbol}
              </Text>
            </View>
          </LabeledBlock>
          <Spacer width={8} />
          <LabeledBlock
            i18nLabel={I18N.transactionNetwork}
            style={styles.labeledBlock}
            onPress={onNetworkPress}>
            <View style={styles.cryptoBlockWrapper}>
              <Text
                style={styles.cryptoBlockTitle}
                variant={TextVariant.t11}
                color={Color.textBase1}
                numberOfLines={1}
                ellipsizeMode="tail">
                {Provider.selectedProvider.name}
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
            token={token}
          />
        </Spacer>
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
  },
);

const styles = createTheme({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
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
  labeledBlock: {
    alignItems: 'center',
    flex: 1,
  },
  container: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
});
