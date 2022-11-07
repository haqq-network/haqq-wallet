import React, {useMemo} from 'react';

import {TouchableWithoutFeedback, View, ViewStyle} from 'react-native';

import {Text} from './text';

import {Color} from '../../colors';
import {createTheme} from '../../helpers/create-theme';

export type SegmentedControlValue<T> = {
  value: T;
  name: string;
};

export type SegmentedControlProps<T> = {
  value: T | undefined;
  values: SegmentedControlValue<T>[];
  onChange: (value: T) => void;
  style?: ViewStyle;
};

export const SegmentedControl = ({
  values,
  value,
  style,
  onChange,
}: SegmentedControlProps<any>) => {
  const container = useMemo(() => [page.container, style], [style]);
  return (
    <View style={container}>
      {values.map(v => (
        <TouchableWithoutFeedback
          key={v.value}
          onPress={() => {
            onChange(v.value);
          }}>
          <View style={[page.item, v.value === value && page.itemActive]}>
            <Text
              t14={v.value !== value}
              t13={v.value === value}
              style={page.text}>
              {v.name}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      ))}
    </View>
  );
};

const page = createTheme({
  container: {
    backgroundColor: Color.bg3,
    padding: 3,
    borderRadius: 14,
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  itemActive: {
    backgroundColor: Color.bg1,
    borderRadius: 12,
  },
  text: {
    color: Color.textBase1,
  },
});
