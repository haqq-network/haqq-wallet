import React from 'react';

import {PATTERNS_SOURCE} from '@env';
import {Image, StyleProp, StyleSheet, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {RemoteConfig} from '@app/services/remote-config';
import {createTheme} from '@app/theme';
import {
  CARD_DEFAULT_STYLE,
  GRADIENT_END,
  GRADIENT_START,
} from '@app/variables/common';

export type CardSmallProps = {
  children?: React.ReactNode;
  width: number;
  height?: number | undefined;
  style?: StyleProp<ViewStyle> | undefined;
  borderRadius?: number;
  transparent?: boolean;
  withPadding?: boolean;
  colorFrom: string;
  colorTo: string;
  colorPattern: string;
  pattern: string;
};

const HEIGHT_RATIO = 0.692307692;

export const CardSmall = ({
  children,
  width,
  height,
  style,
  colorFrom,
  colorTo,
  colorPattern,
  borderRadius = 16,
  withPadding = true,
  pattern = CARD_DEFAULT_STYLE,
}: CardSmallProps) => {
  const cardHeight = typeof height === 'number' ? height : width * HEIGHT_RATIO;
  return (
    <LinearGradient
      colors={[colorFrom, colorTo]}
      start={GRADIENT_START}
      end={GRADIENT_END}
      style={[
        styles.container,
        withPadding && styles.padding,
        {
          width: width,
          height: cardHeight,
          borderRadius,
        },
        style,
      ]}>
      <Image
        source={{
          uri: `${RemoteConfig.get_env(
            'pattern_source',
            PATTERNS_SOURCE,
          )}${pattern}.png`,
        }}
        style={[
          {
            width: width,
            height: cardHeight,
            tintColor: colorPattern,
          },
          StyleSheet.absoluteFillObject,
        ]}
      />
      {children}
    </LinearGradient>
  );
};

const styles = createTheme({
  container: {
    overflow: 'hidden',
  },
  padding: {
    padding: 16,
  },
});
