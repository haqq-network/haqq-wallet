import React from 'react';

import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

import {Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

export type BlockProps = {
  name?: string;
  i18n?: I18N;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  short?: boolean;
};
export const Block = ({name, children, style, short, i18n}: BlockProps) => {
  return (
    <View style={StyleSheet.compose<ViewStyle>(styles.container, style)}>
      <Text
        t9
        i18n={i18n}
        style={StyleSheet.compose(styles.name, short && styles.short)}>
        {name}
      </Text>
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
