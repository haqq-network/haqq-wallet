import React from 'react';
import {Image, StyleProp, StyleSheet, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {PATTERNS_SOURCE} from '@env';
import {
  CARD_DEFAULT_STYLE,
  GRADIENT_END,
  GRADIENT_START,
} from '../../variables';

export type CardSmallProps = {
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

export const CardSmall = ({
  children,
  width,
  style,
  colorFrom,
  colorTo,
  colorPattern,
  borderRadius = 16,
  pattern = CARD_DEFAULT_STYLE,
}: CardSmallProps) => {
  return (
    <LinearGradient
      colors={[colorFrom, colorTo]}
      start={GRADIENT_START}
      end={GRADIENT_END}
      style={[
        page.container,
        {
          width: width,
          height: width * 0.692307692,

          borderRadius,
        },
        style,
      ]}>
      <Image
        source={{uri: `${PATTERNS_SOURCE}${pattern}.png`}}
        style={[
          {
            width: width,
            height: width * 0.692307692,
            tintColor: colorPattern,
          },
          StyleSheet.absoluteFillObject,
        ]}
      />
      {children}
    </LinearGradient>
  );
};

const page = StyleSheet.create({
  container: {
    padding: 16,
    overflow: 'hidden',
  },
});
