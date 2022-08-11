import {StyleSheet, TouchableOpacity, ViewProps} from 'react-native';
import * as React from 'react';
import {useMemo} from 'react';

export type IconButtonProps = ViewProps & {
  onPress: () => void;
};

export const IconButton = ({style, children, ...props}: IconButtonProps) => {
  const containerStyle = useMemo(() => [page.container, style], [style]);

  return (
    <TouchableOpacity style={containerStyle} {...props}>
      {children}
    </TouchableOpacity>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
