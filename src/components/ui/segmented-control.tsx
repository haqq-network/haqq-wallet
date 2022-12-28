import React, {useMemo} from 'react';

import {
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui/text';
import {useThematicStyles} from '@app/hooks';
import {I18N} from '@app/i18n';

export type SegmentedControlValue<T> = {
  value: T;
  name: I18N;
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
  const styles = useThematicStyles(stylesObj);
  const container = useMemo(() => [styles.container, style], [style, styles]);
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
              i18n={v.name}
              color={Color.textBase1}
            />
          </View>
        </TouchableWithoutFeedback>
      ))}
    </View>
  );
};

const stylesObj = StyleSheet.create({
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
