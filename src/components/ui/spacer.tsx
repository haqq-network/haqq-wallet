import React, {useMemo} from 'react';

import {View, ViewProps} from 'react-native';

import {createTheme} from '@app/helpers';

export type SpacerProps = ViewProps & {
  height?: number;
  width?: number;
  centered?: boolean;
};

export const Spacer = ({
  children,
  style,
  height,
  width,
  centered,
  ...props
}: SpacerProps) => {
  const container = useMemo(() => {
    const hasSizeProp = !!height || !!width;
    return [
      hasSizeProp
        ? {
            height,
            width,
          }
        : styles.flexOne,
      centered && styles.centered,
      style,
    ].filter(Boolean);
  }, [height, width, centered, style]);

  return (
    <View style={container} {...props}>
      {children}
    </View>
  );
};

const styles = createTheme({
  flexOne: {flex: 1},
  centered: {justifyContent: 'center'},
});
