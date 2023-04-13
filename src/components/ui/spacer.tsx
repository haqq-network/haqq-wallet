import React, {useMemo} from 'react';

import {View, ViewProps} from 'react-native';

import {createTheme} from '@app/helpers';

export type SpacerProps = ViewProps & {
  height?: number;
  minHeight?: number;
  minWidth?: number;
  width?: number;
  centered?: boolean;
  flex?: number;
};

export const Spacer = ({
  children,
  style,
  height,
  width,
  minHeight,
  minWidth,
  centered,
  flex,
  ...props
}: SpacerProps) => {
  const container = useMemo(() => {
    const hasSizeProp = !!(
      typeof height !== 'undefined' ||
      typeof minHeight !== 'undefined' ||
      typeof width !== 'undefined' ||
      typeof flex !== 'undefined' ||
      typeof minWidth !== 'undefined'
    );
    return [
      hasSizeProp
        ? {
            height,
            width,
            minHeight,
            flex,
            minWidth,
          }
        : styles.flexOne,
      centered && styles.centered,
      style,
    ].filter(Boolean);
  }, [height, minHeight, width, flex, minWidth, centered, style]);

  return (
    <View style={container} {...props}>
      {children}
    </View>
  );
};

const styles = createTheme({
  flexOne: {flex: undefined},
  centered: {justifyContent: 'center'},
});
