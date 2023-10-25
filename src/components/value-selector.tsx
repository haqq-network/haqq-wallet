import React, {useCallback, useState} from 'react';

import {StyleProp, ViewStyle} from 'react-native';

import {PopupContainer} from '@app/components/ui';
import {AwaitValue} from '@app/helpers/await-for-value';

import {ValueRow} from './value-row';

interface Props {
  values: AwaitValue[];
  initialIndex?: number;
  style?: StyleProp<ViewStyle>;

  onValueSelected?(index: number): void;
}

export const ValueSelector = ({
  values,
  onValueSelected,
  initialIndex = -1,
  style,
}: Props) => {
  const [selected, setSelected] = useState(initialIndex);

  const handleValuePress = useCallback(
    (value: AwaitValue) => {
      const idx = values.indexOf(value);
      if (idx > -1) {
        setSelected(idx);
        onValueSelected?.(idx);
      }
    },
    [onValueSelected, selected],
  );

  return (
    <PopupContainer style={style}>
      {values?.map?.((value, idx) => {
        return (
          <ValueRow
            key={value.id}
            item={value}
            hideArrow
            checked={idx === selected}
            onPress={handleValuePress}
          />
        );
      })}
    </PopupContainer>
  );
};
