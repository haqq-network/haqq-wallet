import React, {useMemo} from 'react';
import {Image, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  CARD_DEFAULT_STYLE,
  GRADIENT_END,
  GRADIENT_START,
} from '../../variables';
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
  onLoad?: () => void;
};

export const Card = ({
  children,
  width,
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
            height: width * 0.632835821,
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
    <LinearGradient
      colors={[colorFrom, colorTo]}
      start={GRADIENT_START}
      end={GRADIENT_END}
      style={[
        page.container,
        {
          width: width,
          height: width * 0.612835821,
          borderRadius,
        },
        style,
      ]}>
      <Image
        source={uri}
        onLoad={onLoad}
        style={[
          {
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
    position: 'relative',
  },
});
