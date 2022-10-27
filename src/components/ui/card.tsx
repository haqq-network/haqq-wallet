import React, {useMemo} from 'react';
import {Image, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  CARD_DEFAULT_STYLE,
  GRADIENT_END,
  GRADIENT_START,
  MAGIC_CARD_HEIGHT,
} from '../../variables';
import {getPatternName} from '../../utils';

export type CardProps = {
  children?: React.ReactNode;
  width: number;
  height?: number;
  style?: StyleProp<ViewStyle> | undefined;
  borderRadius?: number;
  transparent?: boolean;
  colorFrom: string;
  colorTo: string;
  colorPattern: string;
  pattern: string;
  onLoad?: () => void;
};

export const Card = ({
  children,
  width,
  height,
  style,
  colorFrom,
  colorTo,
  colorPattern,
  onLoad,
  borderRadius = 16,
  transparent = false,
  pattern = CARD_DEFAULT_STYLE,
}: CardProps) => {
  const uri = useMemo(() => ({uri: getPatternName(pattern)}), [pattern]);
  if (transparent) {
    return (
      <View
        style={[
          page.container,
          {
            width: width,
            height: height || Math.max(width * MAGIC_CARD_HEIGHT, 212),
            borderRadius,
          },
          style,
        ]}>
        <Image
          onLoad={onLoad}
          source={uri}
          style={[
            {
              tintColor: colorPattern,
            },
            StyleSheet.absoluteFillObject,
          ]}
        />
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        {
          width: width,
          height: height || Math.max(width * MAGIC_CARD_HEIGHT, 212),
          borderRadius,
        },
        style,
      ]}>
      <LinearGradient
        colors={[colorFrom, colorTo]}
        start={GRADIENT_START}
        end={GRADIENT_END}
        style={[page.container, {borderRadius}]}>
        <Image
          source={uri}
          onLoad={onLoad}
          style={[
            {
              tintColor: colorPattern,
              borderRadius,
            },
            StyleSheet.absoluteFillObject,
          ]}
        />
        {children}
      </LinearGradient>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    position: 'relative',
  },
});
