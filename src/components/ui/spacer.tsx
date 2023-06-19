import React, {useMemo} from 'react';

import {StyleSheet, View, ViewProps} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {addOpacityToColor} from '@app/utils';

export type SpacerProps = ViewProps & {
  height?: number;
  minHeight?: number;
  width?: number;
  centered?: boolean;
  debug?: boolean;
  flex?: number;
};

export const Spacer = ({
  children,
  style,
  height,
  width,
  minHeight,
  centered,
  debug,
  flex,
  ...props
}: SpacerProps) => {
  const container = useMemo(() => {
    const hasSizeProp = !!(height || minHeight || width);
    return [
      hasSizeProp
        ? {
            height,
            width,
            minHeight,
            flex,
          }
        : styles.flexOne,
      centered && styles.centered,
      debug && __DEV__ && styles.debug,
      style,
    ].filter(Boolean);
  }, [height, minHeight, width, flex, centered, debug, style]);

  return (
    <View style={container} {...props}>
      {children}
    </View>
  );
};

const styles = createTheme({
  flexOne: {flex: 1},
  centered: {justifyContent: 'center', alignItems: 'center'},
  debug: {
    backgroundColor: addOpacityToColor(Color.graphicRed1, 0.5),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Color.graphicGreen1,
  },
});
