import React, {useMemo} from 'react';
import {Image, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {GRADIENT_END, GRADIENT_START} from '../../variables';
import {WalletCardPattern} from '../../types';

export type CardProps = {
  children?: React.ReactNode;
  width: number;
  style?: StyleProp<ViewStyle> | undefined;
  borderRadius?: number;
  transparent?: boolean;
  colorFrom: string;
  colorTo: string;
  colorPattern: string;
  pattern: WalletCardPattern;
};

const patterns = {
  [WalletCardPattern.circle]: require('../../../assets/images/card-circles-0.png'),
  [WalletCardPattern.rhombus]: require('../../../assets/images/card-rhombus-0.png'),
};

console.log('patterns', patterns);

export const Card = ({
  children,
  width,
  style,
  colorFrom,
  colorTo,
  colorPattern,
  borderRadius = 16,
  transparent = false,
  pattern = WalletCardPattern.circle,
}: CardProps) => {
  const image = useMemo(
    () => (
      <Image
        source={patterns[pattern]}
        style={[
          {
            width: width,
            height: width * 0.632835821,
            zIndex: -1,
            tintColor: colorPattern,
          },
          StyleSheet.absoluteFillObject,
        ]}
      />
    ),
    [colorPattern, pattern, width],
  );
  if (transparent) {
    return (
      <View
        style={[
          {
            width: width,
            height: width * 0.632835821,
            padding: 16,
            borderRadius,
            overflow: 'hidden',
            position: 'relative',
          },
          style,
        ]}>
        {image}
        {children}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colorFrom, colorTo]}
      start={GRADIENT_START}
      end={GRADIENT_END}
      style={[
        {
          width: width,
          height: width * 0.632835821,
          padding: 16,
          borderRadius,
          overflow: 'hidden',
          position: 'relative',
        },
        style,
      ]}>
      {image}
      {children}
    </LinearGradient>
  );
};
