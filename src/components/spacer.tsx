import React, {useMemo} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';

export type SpacerProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle> | undefined;
};

export const Spacer = ({children, style}: SpacerProps) => {
  const container = useMemo(() => [{flex: 1}, style].filter(Boolean), [style]);
  return <View style={container}>{children}</View>;
};
