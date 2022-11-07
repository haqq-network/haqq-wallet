import React, {useMemo} from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';

import {Text} from './text';

import {Color} from '../../colors';
import {createTheme} from '../../helpers/create-theme';

export type DataViewProps = {
  label: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const DataView = ({label, children, style}: DataViewProps) => {
  const containerStyle = useMemo(() => [page.container, style], [style]);
  return (
    <View style={containerStyle}>
      <Text style={page.t11} t11>
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
  t11: {
    color: Color.textBase2,
  },
});
