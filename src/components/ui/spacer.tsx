import React, {useMemo} from 'react';

import {StyleSheet, View, ViewProps} from 'react-native';

export type SpacerProps = ViewProps & {
  height?: number;
  minHeight?: number;
  width?: number;
  centered?: boolean;
};

export const Spacer = ({
  children,
  style,
  height,
  width,
  minHeight,
  centered,
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
          }
        : styles.flexOne,
      centered && styles.centered,
      style,
    ].filter(Boolean);
  }, [height, minHeight, width, centered, style]);

  return (
    <View style={container} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  flexOne: {flex: 1},
  centered: {justifyContent: 'center'},
});
