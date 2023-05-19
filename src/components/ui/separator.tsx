import React from 'react';

import {View, ViewProps} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';

export type SeparatorProps = ViewProps;

export const Separator = ({style, ...props}: SeparatorProps) => {
  return <View style={[styles.separator, style]} {...props} />;
};

const styles = createTheme({
  separator: {
    backgroundColor: Color.graphicSecond2,
    width: '100%',
    height: 1,
  },
});
