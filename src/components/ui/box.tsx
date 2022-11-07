import React, {useMemo} from 'react';

import {View, ViewProps} from 'react-native';

import {Color} from '../../colors';
import {createTheme} from '../../helpers/create-theme';

export const Box = ({children, style, ...props}: ViewProps) => {
  const container = useMemo(() => [page.container, style], [style]);
  return (
    <View style={container} {...props}>
      {children}
    </View>
  );
};

const page = createTheme({
  container: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.bg8,
    borderRadius: 12,
  },
});
