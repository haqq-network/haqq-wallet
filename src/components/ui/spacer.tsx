import React, {useMemo} from 'react';

import {View, ViewProps} from 'react-native';

import {createTheme} from '@app/helpers';

export type SpacerProps = ViewProps & {
  height?: number;
  minHeight?: number;
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
  centered,
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
      style,
    ].filter(Boolean);
  }, [height, minHeight, width, flex, centered, style]);

  return (
    <View style={container} {...props}>
      {children}
    </View>
  );
};

const styles = createTheme({
  flexOne: {flex: 1},
  centered: {justifyContent: 'center', alignItems: 'center'},
});
