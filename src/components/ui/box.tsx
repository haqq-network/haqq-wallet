import React, {useMemo} from 'react';

import {StyleSheet, View, ViewProps} from 'react-native';

import {Color} from '@app/colors';
import {useThematicStyles} from '@app/hooks';

export const Box = ({children, style, ...props}: ViewProps) => {
  const styles = useThematicStyles(stylesObj);
  const container = useMemo(() => [styles.container, style], [style, styles]);
  return (
    <View style={container} {...props}>
      {children}
    </View>
  );
};

const stylesObj = StyleSheet.create({
  container: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.bg8,
    borderRadius: 12,
  },
});
