import React, {useCallback, useMemo, useRef} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {PixelRatio, Pressable, StyleSheet, TextInput, View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {Button, ButtonSize, ButtonVariant} from '@app/components/ui/button';
import {Text} from '@app/components/ui/text';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {Balance} from '@app/types';
import {WINDOW_WIDTH} from '@app/variables/common';

export type SumBlockProps = {
  value: string;
  error: string;
  currency: string;
  balance: Balance;
  onChange: (value: string) => void;
  onMax: () => void;
  testID?: string;
};
export const SumBlock = ({
  onChange,
  value,
  balance,
  currency,
  onMax,
  error,
  testID,
}: SumBlockProps) => {
  const inputSumRef = useRef<TextInput>(null);

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
    () => (value.length > 0 ? (WINDOW_WIDTH - 180) / value.length : 30),
    [value.length],
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

  return (
    <View style={styles.container} testID={testID}>
      <Text t8 center style={styles.subtitle} color={Color.textBase2}>
        {currency}
      </Text>
      <View style={styles.sum}>
        <View style={styles.swap}>
          {/*<IconButton onPress={onPressSwap} style={page.swapButton}>*/}
          {/*  <SwapVerticalIcon color={GRAPHIC_GREEN_1} />*/}
          {/*</IconButton>*/}
        </View>
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
            />
          )}
        </View>
      </View>
      {/*<View style={page.amount}>*/}
      {/*  <Text t15>$ {amountUsd}</Text>*/}
      {/*</View>*/}
      {error ? (
        <Text center color={Color.textRed1} t14 testID={`${testID}_error`}>
          {error}
        </Text>
      ) : (
        <Text center color={Color.textBase2} t14 testID={`${testID}_hint`}>
          {getText(I18N.sumBlockAvailable)}:{' '}
          <Text t14 color={Color.textGreen1}>
            {balance.toFloatString()} {currency}
          </Text>
        </Text>
      )}
    </View>
  );
};

const styles = createTheme({
  container: {
    width: '100%',
  },
  subtitle: {
    marginBottom: 4,
  },
  sum: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
  },
});
