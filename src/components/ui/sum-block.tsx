import React, {useCallback, useMemo, useRef} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {observer} from 'mobx-react';
import {
  PixelRatio,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import {Color, getColor} from '@app/colors';
import {Button, ButtonSize, ButtonVariant} from '@app/components/ui/button';
import {Text, TextPosition, TextVariant} from '@app/components/ui/text';
import {app} from '@app/contexts';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Balance} from '@app/services/balance';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {IToken} from '@app/types';

import {Spacer} from './spacer';

export type SumBlockProps = {
  value: string;
  error: string;
  currency?: string | null;
  balance: Balance;
  onChange: (value: string) => void;
  onMax: () => void;
  testID?: string;
  token?: IToken;
};
export const SumBlock = observer(
  ({
    onChange,
    value,
    balance,
    currency,
    onMax,
    error,
    testID,
    token,
  }: SumBlockProps) => {
    const inputSumRef = useRef<TextInput>(null);
    const dimensions = useWindowDimensions();
    useFocusEffect(
      useCallback(() => {
        setTimeout(() => inputSumRef.current?.focus(), 500);
      }, []),
    );

    const onChangeValue = useCallback(
      (newValue: string) => {
        const sum = newValue.replace(/,/g, '.');
        onChange(sum);
      },
      [onChange],
    );

    const ratio = useMemo(
      () => (value.length > 0 ? (dimensions.width - 180) / value.length : 30),
      [dimensions.width, value.length],
    );

    const fontSize = Math.max(
      Math.min(PixelRatio.roundToNearestPixel(ratio / 0.61), 34),
      18,
    );

    const lineHeight = PixelRatio.roundToNearestPixel(fontSize / 0.809);

    const onFocusInput = () => {
      inputSumRef.current?.focus();
    };

    const onPressMax = useCallback(() => {
      vibrate(HapticEffects.impactLight);
      onMax();
    }, [onMax]);

    const fiatString = useMemo(() => {
      if (token?.decimals && token?.symbol && token.is_erc20) {
        return new Balance(Number(value), token.decimals, token.symbol).toFiat({
          fixed: 'auto',
        });
      }

      return new Balance(Number(value)).toFiat({
        fixed: 'auto',
      });
    }, [token?.decimals, token?.symbol, value]);

    return (
      <View style={styles.container} testID={testID}>
        <Text
          variant={TextVariant.t8}
          position={TextPosition.center}
          style={styles.subtitle}
          color={Color.textBase2}>
          {currency || app.provider.denom}
        </Text>
        <View style={styles.sum}>
          <Spacer flex={1} />
          <Pressable onPress={onFocusInput} style={styles.inputContainer}>
            <TextInput
              allowFontScaling={false}
              style={StyleSheet.compose(styles.input, {
                fontSize,
                lineHeight,
              })}
              value={value}
              placeholder="0"
              onChangeText={onChangeValue}
              keyboardType="numeric"
              placeholderTextColor={getColor(Color.textBase2)}
              ref={inputSumRef}
              textAlign="left"
              testID={`${testID}_input`}
            />
          </Pressable>
          <View style={styles.max}>
            {balance.isPositive() && (
              <Button
                title={getText(I18N.sumBlockMax)}
                onPress={onPressMax}
                variant={ButtonVariant.second}
                size={ButtonSize.small}
                testID={`${testID}_max`}
                style={styles.maxButton}
              />
            )}
          </View>
        </View>
        {!!value && (
          <View style={styles.amount}>
            <Text variant={TextVariant.t15} color={Color.textBase2}>
              {fiatString}
            </Text>
          </View>
        )}
        {error ? (
          <Text
            position={TextPosition.center}
            color={Color.textRed1}
            variant={TextVariant.t14}
            testID={`${testID}_error`}>
            {error}
          </Text>
        ) : (
          <Text
            position={TextPosition.center}
            color={Color.textBase2}
            variant={TextVariant.t14}
            testID={`${testID}_hint`}>
            {getText(I18N.sumBlockAvailable)}:{' '}
            <Text variant={TextVariant.t14} color={Color.textGreen1}>
              {balance.toBalanceString('auto')}
            </Text>
          </Text>
        )}
      </View>
    );
  },
);

const styles = createTheme({
  amount: {alignSelf: 'center', marginBottom: 10},
  container: {
    width: '100%',
  },
  subtitle: {
    marginBottom: 4,
  },
  sum: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  max: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  input: {
    width: 'auto',
    alignSelf: 'center',
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 42,
    color: Color.textBase1,
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  inputContainer: {
    flex: 4,
  },
  maxButton: {
    width: '100%',
  },
});
