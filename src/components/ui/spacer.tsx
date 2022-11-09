import React, {useMemo} from 'react';

import {View, ViewProps} from 'react-native';

export type SpacerProps = ViewProps;

export const Spacer = ({children, style, ...props}: SpacerProps) => {
  const container = useMemo(() => [{flex: 1}, style].filter(Boolean), [style]);
  return (
    <View style={container} {...props}>
      {children}
    </View>
  );
};
