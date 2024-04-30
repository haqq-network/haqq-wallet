import React, {PropsWithChildren, useMemo} from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

import {Text, TextVariant} from './text';

export type DataViewProps = {
  label?: string;
  labelStyles?: StyleProp<Text>;
  i18n?: I18N;
  style?: StyleProp<ViewStyle>;
};

export const DataView = ({
  label,
  i18n,
  children,
  labelStyles,
  style,
}: PropsWithChildren<DataViewProps>) => {
  const containerStyle = useMemo(() => [page.container, style], [style]);
  return (
    <View style={containerStyle}>
      {/* @ts-expect-error */}
      <Text
        i18n={i18n}
        variant={TextVariant.t11}
        color={Color.textBase2}
        style={labelStyles}>
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
