import React, {useMemo} from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import {LIGHT_BG_1, LIGHT_BG_3, LIGHT_TEXT_BASE_1} from '../../variables';
import {Text} from './text';

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

const page = StyleSheet.create({
  container: {
    backgroundColor: LIGHT_BG_3,
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
    backgroundColor: LIGHT_BG_1,
    borderRadius: 12,
  },
  text: {
    color: LIGHT_TEXT_BASE_1,
  },
});
