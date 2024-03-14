import React from 'react';

import {View, ViewProps} from 'react-native';

import {Color, createTheme} from '@app/theme';

export type SeparatorProps = {height?: number} & ViewProps;

export const Separator = ({style, height, ...props}: SeparatorProps) => {
  return (
    <View style={[styles.separator, style, !!height && {height}]} {...props} />
  );
};

const styles = createTheme({
  separator: {
    backgroundColor: Color.graphicSecond2,
    width: '100%',
    height: 1,
  },
});
