import React from 'react';
import {
  Image,
  ImageProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  CARD_COLORS,
  CARD_PATTERN,
  GRADIENT_END,
  GRADIENT_START,
} from '../../variables';
import {WalletCardStyle} from '../../types';

export type CardProps = {
  children?: React.ReactNode;
  width: number;
  style?: StyleProp<ViewStyle> | undefined;
  variant?: WalletCardStyle;
  borderRadius?: number;
  transparent?: boolean;
};

const pattern = require('../../../assets/images/card-pattern.png');

export const Card = ({
  children,
  width,
  style,
  variant = WalletCardStyle.defaultGreen,
  borderRadius = 16,
  transparent = false,
}: CardProps) => {
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
        <Image
          source={pattern}
          style={[
            {
              width: width,
              height: width * 0.632835821,
              zIndex: -1,
              tintColor: CARD_PATTERN[variant],
            },
            StyleSheet.absoluteFillObject,
          ]}
        />
        {children}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={CARD_COLORS[variant]}
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
      <Image
        source={pattern}
        style={[
          {
            width: width,
            height: width * 0.632835821,
            zIndex: -1,
            tintColor: CARD_PATTERN[variant],
          },
          StyleSheet.absoluteFillObject,
        ]}
      />
      {children}
    </LinearGradient>
  );
};

export const CardSmall = ({
  children,
  width,
  style,
  variant = WalletCardStyle.defaultGreen,
  borderRadius = 16,
}: CardProps) => {
  return (
    <LinearGradient
      colors={CARD_COLORS[variant]}
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
        source={pattern}
        style={[
          {
            width: width,
            height: width * 0.692307692,
            tintColor: CARD_PATTERN[variant],
          },
          StyleSheet.absoluteFillObject,
        ]}
      />
      {children}
    </LinearGradient>
  );
};

export const CardMask = ({style}: ImageProps) => (
  <Image
    source={require('../../../assets/images/card-maks.png')}
    style={style}
  />
);
