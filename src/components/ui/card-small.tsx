import React from 'react';
import {Image, StyleProp, StyleSheet, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {GRADIENT_END, GRADIENT_START} from '../../variables';
import {WalletCardPattern} from '../../types';

const patterns = {
  [WalletCardPattern.circle]: require('../../../assets/images/card-circles-0.png'),
  [WalletCardPattern.rhombus]: require('../../../assets/images/card-rhombus-0.png'),
};

export type CardSmallProps = {
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

export const CardSmall = ({
  children,
  width,
  style,
  colorFrom,
  colorTo,
  colorPattern,
  borderRadius = 16,
  pattern = WalletCardPattern.circle,
}: CardSmallProps) => {
  return (
    <LinearGradient
      colors={[colorFrom, colorTo]}
      start={GRADIENT_START}
      end={GRADIENT_END}
      style={[
        {
          width: width,
          height: width * 0.692307692,
          padding: 16,
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}>
      <Image
        source={patterns[pattern]}
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
