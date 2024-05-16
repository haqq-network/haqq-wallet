import React, {useMemo} from 'react';

import {Image, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {getPatternName} from '@app/utils';
import {
  CARD_DEFAULT_STYLE,
  GRADIENT_END,
  GRADIENT_START,
} from '@app/variables/common';

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
  testID?: string;
};

export const Card = ({
  testID,
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
            height: height,
            borderRadius,
          },
          style,
        ]}
        testID={testID}>
        <Image
          onLoad={onLoad}
          source={uri}
          style={[
            {
              tintColor: colorPattern,
            },
            page.image,
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
          height: height,
          borderRadius,
        },
        style,
      ]}
      testID={testID}>
      <LinearGradient
        colors={[colorFrom, colorTo]}
        start={GRADIENT_START}
        end={GRADIENT_END}
        style={[page.container, {borderRadius}, style]}>
        <Image
          source={uri}
          onLoad={onLoad}
          style={[
            {
              tintColor: colorPattern,
              borderRadius,
            },
            page.image,
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
    paddingHorizontal: 16,
    paddingVertical: 20,
    position: 'relative',
  },
  image: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
  },
});
