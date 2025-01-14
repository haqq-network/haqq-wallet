import React, {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';
import {Platform, View} from 'react-native';
import AnimatedRollingNumber from 'react-native-animated-rolling-numbers';
import {Easing} from 'react-native-reanimated';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useSumAmount} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Currencies} from '@app/models/currencies';
import {Balance} from '@app/services/balance';
import {IToken} from '@app/types';
import {
  LONG_NUM_PRECISION,
  SPACE_OR_NBSP,
  STRINGS,
  WEI_PRECISION,
} from '@app/variables/common';

import {ImageWrapper} from '../image-wrapper';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  First,
  LabeledBlock,
  Spacer,
  Text,
  TextField,
  TextFieldProps,
  TextVariant,
} from '../ui';
import {Placeholder} from '../ui/placeholder';

export type SwapInputProps = {
  token: IToken;
  currentBalance: Balance;
  availableBalance: Balance;
  amounts: ReturnType<typeof useSumAmount>;
  isLoading?: boolean;
  showMaxButton?: boolean;
  disableTextFieldLoader?: boolean;
  onPressMax?(): void;
  onPressChangeToken(): void;
} & Pick<
  TextFieldProps,
  'onBlur' | 'editable' | 'label' | 'placeholder' | 'autoFocus'
>;

export const SwapInput = observer(
  ({
    amounts,
    availableBalance,
    currentBalance,
    token,
    isLoading,
    showMaxButton = false,
    disableTextFieldLoader = false,
    onPressChangeToken,
    onPressMax,
    ...inputProps
  }: SwapInputProps) => {
    const [amount, amountSymbol] = useMemo(() => {
      const balance = currentBalance
        .toFiat({
          useDefaultCurrency: false,
          withoutSymbol: true,
        })
        .replaceAll(SPACE_OR_NBSP, '');
      const parsed = parseFloat(balance);

      if (Number.isNaN(parsed)) {
        return [parseFloat(amounts.amount || '0'), currentBalance.getSymbol()];
      }

      return [
        parsed,
        Currencies.currency?.postfix || Currencies.currency?.prefix,
      ];
    }, [currentBalance]);

    const [available, availableSymbol] = useMemo(() => {
      const balance = availableBalance
        .toBalanceString('auto', undefined, false, true)
        .replaceAll(SPACE_OR_NBSP, '');

      const parsed = parseFloat(balance);

      if (Number.isNaN(parsed)) {
        return [0, availableBalance.getSymbol()];
      }

      return [parsed, availableBalance.getSymbol()];
    }, [availableBalance]);

    const handleOnChangeText = useCallback(
      (text: string) => {
        let decimalsOffset = 0;

        if (text.startsWith('0.')) {
          decimalsOffset = 2;
        }

        const decimals = (token.decimals || WEI_PRECISION) + decimalsOffset;
        amounts.setAmount(text?.trim()?.slice(0, decimals));
      },
      [amounts, token, availableBalance, currentBalance],
    );
    return (
      <View>
        <View style={styles.amountContainer}>
          <First>
            {isLoading &&
              !amounts?.amountBalance?.isPositive() &&
              disableTextFieldLoader === false && (
                <View style={styles.amountInput}>
                  <Placeholder opacity={0.7}>
                    <Placeholder.Item width={'100%'} height={58} />
                  </Placeholder>
                </View>
              )}
            <TextField
              rightAction={
                showMaxButton ? (
                  <Button
                    i18n={I18N.swapScreenMax}
                    variant={ButtonVariant.text}
                    textColor={
                      isLoading ? Color.textBase2 : Color.graphicGreen1
                    }
                    size={ButtonSize.small}
                    onPress={onPressMax}
                    disabled={isLoading}
                  />
                ) : undefined
              }
              style={styles.amountInput}
              error={!!amounts.error && amounts.amountBalance?.isPositive()}
              errorText={amounts.error}
              {...inputProps}
              value={amounts.amount}
              onChangeText={handleOnChangeText}
              keyboardType="numeric"
              inputMode="decimal"
              returnKeyType="done"
            />
          </First>
          <Spacer width={10} />

          <LabeledBlock
            i18nLabel={I18N.transactionCrypto}
            style={styles.cryptoBlock}
            onPress={onPressChangeToken}>
            <View style={styles.cryptoBlockWrapper}>
              {!!token.image && (
                <ImageWrapper
                  style={styles.cryptoBlockImage}
                  source={token.image}
                />
              )}
              <Text
                style={styles.cryptoBlockTitle}
                t11
                color={Color.textBase1}
                numberOfLines={1}
                ellipsizeMode="middle">
                {token.symbol}
              </Text>
            </View>
          </LabeledBlock>
        </View>

        <View style={styles.balanceContainer}>
          <Spacer height={4} />
          <Text variant={TextVariant.t14} color={Color.textBase2}>
            {`≈${STRINGS.NBSP}`}
          </Text>
          <AnimatedRollingNumber
            useGrouping
            textStyle={styles.inputRolling}
            containerStyle={styles.inputRollingContainer}
            value={amount}
            toFixed={String(amount).substring(0, LONG_NUM_PRECISION).length}
            spinningAnimationConfig={{
              duration: 500,
              easing: Easing.bounce,
            }}
          />
          <Text variant={TextVariant.t14} color={Color.textBase2}>
            {STRINGS.NBSP}
            {amountSymbol}
          </Text>
          <Text variant={TextVariant.t14} color={Color.textBase2}>
            {STRINGS.NBSP}
            {getText(I18N.swapInputAmountData, {
              currentFiatAmount: '',
              availableAmount: '',
            }).replace('≈', '')}
          </Text>
          <AnimatedRollingNumber
            useGrouping
            textStyle={styles.inputRolling}
            containerStyle={styles.inputRollingContainer}
            value={available}
            toFixed={String(available).substring(0, LONG_NUM_PRECISION).length}
            spinningAnimationConfig={{
              duration: 500,
              easing: Easing.bounce,
            }}
          />
          <Text variant={TextVariant.t14} color={Color.textBase2}>
            {STRINGS.NBSP}
            {availableSymbol}
          </Text>
        </View>
      </View>
    );
  },
);

const styles = createTheme({
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  inputRollingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRolling: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    fontSize: 14,
    color: getColor(Color.textBase2),
    ...Platform.select({
      ios: {
        fontFamily: 'SF Pro Display',
        fontWeight: '400',
      },
      android: {
        fontFamily: 'SF-Pro-Display-Regular',
      },
    }),
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountInput: {
    flex: 3.5,
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
  cryptoBlock: {
    flex: 1,
    alignItems: 'center',
    height: 58,
  },
});
