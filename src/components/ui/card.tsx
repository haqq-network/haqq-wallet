import React from 'react';
import {Image, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {GRADIENT_END, GRADIENT_START} from '../../variables';

export type CardProps = {
  children?: React.ReactNode;
  width: number;
  style?: StyleProp<ViewStyle> | undefined;
  borderRadius?: number;
  transparent?: boolean;
  colorFrom: string;
  colorTo: string;
  colorPattern: string;
};

const pattern = require('../../../assets/images/card-pattern.png');

export const Card = ({
  children,
  width,
  style,
  colorFrom,
  colorTo,
  colorPattern,
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
            tintColor: colorPattern,
          },
          StyleSheet.absoluteFillObject,
        ]}
      />
      {children}
    </LinearGradient>
  );
};
