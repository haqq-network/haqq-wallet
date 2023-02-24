import React from 'react';

import {Platform, StyleProp, View, ViewStyle} from 'react-native';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';

export interface DashedLineProps {
  width: number;
  color?: Color;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_LINE_COLOR = Color.graphicBase2;

export const DashedLine = Platform.select({
  ios: ({color = DEFAULT_LINE_COLOR, width, style}: DashedLineProps) => {
    return (
      <View style={[styles.iosContainer, style]}>
        <View style={[styles.iosDashedLine, {borderColor: getColor(color)}]}>
          <View style={[styles.lineSize, {width}]} />
        </View>
      </View>
    );
  },
  android: ({color = DEFAULT_LINE_COLOR, width, style}: DashedLineProps) => {
    return (
      <View
        style={[
          styles.androidDashedLine,
          styles.lineSize,
          {borderBottomColor: getColor(color), width},
          style,
        ]}
      />
    );
  },
}) as React.FC<DashedLineProps>;

const styles = createTheme({
  iosDashedLine: {
    borderStyle: 'dashed',
    borderWidth: 1,
    margin: -1,
    marginTop: 0,
  },
  iosContainer: {
    overflow: 'hidden',
  },
  lineSize: {
    height: 1,
  },
  androidDashedLine: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
  },
});
