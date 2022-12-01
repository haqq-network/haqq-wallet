import React, {useMemo} from 'react';

import {TouchableWithoutFeedback, View, ViewStyle} from 'react-native';

import {Color, getColor} from '@app/colors';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

import {Text} from './text';

export type SegmentedControlValue<T> = {
  value: T;
  name: string;
  i18nName?: I18N;
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
  const container = useMemo(() => [styles.container, style], [style]);
  return (
    <View style={container}>
      {values.map(v => (
        <TouchableWithoutFeedback
          key={v.value}
          onPress={() => {
            onChange(v.value);
          }}>
          <View style={[styles.item, v.value === value && styles.itemActive]}>
            <Text
              t14={v.value !== value}
              t13={v.value === value}
              i18n={v.i18nName}
              color={getColor(Color.textBase1)}>
              {v.name}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      ))}
    </View>
  );
};

const styles = createTheme({
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
});
