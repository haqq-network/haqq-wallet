import React, {useMemo} from 'react';

import {View, ViewProps} from 'react-native';

import {createTheme} from '@app/helpers';

export type SpacerProps = ViewProps & {height?: number; width?: number};

export const Spacer = ({
  children,
  style,
  height,
  width,
  ...props
}: SpacerProps) => {
  const container = useMemo(() => {
    const hasSizeProp = !!height || !!width;
    return [hasSizeProp ? {height, width} : styles.flexOne, style].filter(
      Boolean,
    );
  }, [style, height, width]);

  return (
    <View style={container} {...props}>
      {children}
    </View>
  );
};

const styles = createTheme({
  flexOne: {flex: 1},
});
