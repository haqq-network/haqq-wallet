import React, {useCallback, useMemo, useRef} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {
  PixelRatio,
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';

import {Color, getColor} from '@app/colors';
import {Button, ButtonSize, ButtonVariant} from '@app/components/ui/button';
import {Text} from '@app/components/ui/text';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {cleanNumber} from '@app/utils';
import {WINDOW_WIDTH} from '@app/variables';

export type SumBlockProps = {
  value: string;
  error: string;
  currency: string;
  balance: number;
  onChange: (value: string) => void;
  onMax: () => void;
  style?: StyleProp<ViewStyle>;
};
export const SumBlock = ({
  onChange,
  value,
  balance,
  currency,
  onMax,
  error,
  style,
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

  return (
    <View style={style}>
      <Text t8 center style={styles.subtitle} color={Color.textBase2}>
        {currency}
      </Text>
      <View style={styles.sum}>
        <View style={styles.swap}>
          {/*<IconButton onPress={onPressSwap} style={page.swapButton}>*/}
          {/*  <SwapVerticalIcon color={GRAPHIC_GREEN_1} />*/}
          {/*</IconButton>*/}
        </View>
        <TextInput
          allowFontScaling={false}
          style={StyleSheet.compose(styles.input, {fontSize, lineHeight})}
          value={value}
          placeholder="0"
          onChangeText={onChangeValue}
          keyboardType="numeric"
          placeholderTextColor={getColor(Color.textBase2)}
          ref={inputSumRef}
          textAlign="center"
        />
        <View style={styles.max}>
          {balance > 0 && (
            <Button
              title={getText(I18N.sumBlockMax)}
              onPress={onMax}
              variant={ButtonVariant.second}
              size={ButtonSize.small}
            />
          )}
        </View>
      </View>
      {/*<View style={page.amount}>*/}
      {/*  <Text t15>$ {amountUsd}</Text>*/}
      {/*</View>*/}
      {error ? (
        <Text center color={Color.textRed1} t14>
          {error}
        </Text>
      ) : (
        <Text center color={Color.textBase2} t14>
          {getText(I18N.sumBlockAvailable)}:{' '}
          <Text clean color={Color.textGreen1}>
            {cleanNumber(balance.toFixed(2))} {currency}
          </Text>
        </Text>
      )}
    </View>
  );
};

const styles = createTheme({
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
    flex: 1,
    fontWeight: '700',
    fontSize: 34,
    lineHeight: 42,
    color: Color.textBase1,
    paddingVertical: 2,
  },
});
