import React, {useMemo} from 'react';
import {Image, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  CARD_DEFAULT_STYLE,
  GRADIENT_END,
  GRADIENT_START,
} from '../../variables';
import {WalletCardPattern} from '../../types';
import {PATTERNS_SOURCE} from '@env';
import {getPatternName} from '../../utils';

export type CardProps = {
  children?: React.ReactNode;
  width: number;
  style?: StyleProp<ViewStyle> | undefined;
  borderRadius?: number;
  transparent?: boolean;
  colorFrom: string;
  colorTo: string;
  colorPattern: string;
  pattern: string;
};

export const Card = ({
  children,
  width,
  style,
  colorFrom,
  colorTo,
  colorPattern,
  borderRadius = 16,
  transparent = false,
  pattern = CARD_DEFAULT_STYLE,
}: CardProps) => {
  const image = useMemo(
    () => (
      <Image
        source={{uri: getPatternName(pattern)}}
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
