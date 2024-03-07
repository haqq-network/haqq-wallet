import React from 'react';

import {
  DimensionValue,
  Platform,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';

import {createTheme} from '@app/helpers';
import {Color, getColor} from '@app/theme';

export interface Props {
  width: DimensionValue;
  color?: Color;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_LINE_COLOR = Color.graphicBase2;

export const SolidLine = Platform.select({
  ios: ({color = DEFAULT_LINE_COLOR, width, style}: Props) => {
    return (
      <View style={[styles.iosContainer, style]}>
        <View style={[styles.iosSolidLine, {borderColor: getColor(color)}]}>
          <View style={[styles.lineSize, {width}]} />
        </View>
      </View>
    );
  },
  android: ({color = DEFAULT_LINE_COLOR, width, style}: Props) => {
    return (
      <View
        style={[
          styles.androidSolidLine,
          styles.lineSize,
          {borderBottomColor: getColor(color), width},
          style,
        ]}
      />
    );
  },
}) as React.FC<Props>;

const styles = createTheme({
  iosSolidLine: {
    borderStyle: 'solid',
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
  androidSolidLine: {
    borderBottomWidth: 1,
    borderStyle: 'solid',
  },
});
