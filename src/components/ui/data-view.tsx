import React, {useMemo} from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';

import {Text} from './text';

export type DataViewProps = {
  label: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const DataView = ({label, children, style}: DataViewProps) => {
  const containerStyle = useMemo(() => [page.container, style], [style]);
  return (
    <View style={containerStyle}>
      <Text t11 color={Color.textBase2}>
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
