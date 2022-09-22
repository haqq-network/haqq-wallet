import React from 'react';
import {
  Image,
  ImageProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {WalletCardStyle} from '../../models/wallet';

export type CardProps = {
  children?: React.ReactNode;
  width: number;
  style?: StyleProp<ViewStyle> | undefined;
  variant?: WalletCardStyle;
  borderRadius?: number;
};

const cards = {
  [WalletCardStyle.defaultGreen]: require('../../../assets/images/card-green.png'),
  [WalletCardStyle.defaultBlack]: require('../../../assets/images/card-black.png'),
  [WalletCardStyle.defaultBlue]: require('../../../assets/images/card-blue.png'),
  [WalletCardStyle.defaultYellow]: require('../../../assets/images/card-yellow.png'),
};

// yellow: [#E8D06F, #B59235]
// blue: [#125BCA, #1D63A5]
export const CARD_COLORS = {
  [WalletCardStyle.defaultGreen]: ['#03BF77', '#03BF77'],
  [WalletCardStyle.defaultBlack]: ['#383838', '#383838'],
  [WalletCardStyle.defaultBlue]: ['#125BCA', '#1D63A5'],
  [WalletCardStyle.defaultYellow]: ['#E8D06F', '#B59235'],
};

export const Card = ({
  children,
  width,
  style,
  variant = WalletCardStyle.defaultGreen,
  borderRadius = 16,
}: CardProps) => {
  return (
    <View
      style={[
        {
          width: width,
          height: width * 0.632835821,
          padding: 16,
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}>
      <Image
        source={cards[variant]}
        style={[
          {width: width, height: width * 0.632835821},
          StyleSheet.absoluteFillObject,
        ]}
      />
      {children}
    </View>
  );
};

export const CardMask = ({style}: ImageProps) => (
  <Image
    source={require('../../../assets/images/card-maks.png')}
    style={style}
  />
);
