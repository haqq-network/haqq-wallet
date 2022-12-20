import React from 'react';

import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

import {Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export type BlockProps = {
  name: I18N;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  short?: boolean;
};
export const Block = ({children, style, short, name}: BlockProps) => {
  return (
    <View style={StyleSheet.compose<ViewStyle>(styles.container, style)}>
      <Text
        t9
        i18n={name}
        style={StyleSheet.compose(styles.name, short && styles.short)}
      />
      {children}
    </View>
  );
};

const styles = createTheme({
  container: {
    marginVertical: 8,
  },
  name: {
    marginBottom: 4,
  },
  short: {
    marginBottom: 2,
  },
});
