import React, {useMemo} from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';

import {I18N} from '@app/i18n';
import {Color, createTheme} from '@app/theme';

import {Text} from './text';

export type DataViewProps = {
  label?: string;
  children: React.ReactNode;
  i18n?: I18N;
  style?: StyleProp<ViewStyle>;
};

export const DataView = ({label, i18n, children, style}: DataViewProps) => {
  const containerStyle = useMemo(() => [page.container, style], [style]);
  return (
    <View style={containerStyle}>
      {/* @ts-expect-error */}
      <Text i18n={i18n} t11 color={Color.textBase2}>
        {label}
      </Text>
      {children}
    </View>
  );
};

const page = createTheme({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
});
