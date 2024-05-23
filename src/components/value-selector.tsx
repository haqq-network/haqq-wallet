import React, {useCallback, useState} from 'react';

import {StyleProp, ViewStyle} from 'react-native';

import {PopupContainer} from '@app/components/ui';
import {AwaitValue} from '@app/helpers/await-for-value';

import {ValueRow} from './value-row';

interface Props {
  values: AwaitValue[];
  initialIndex?: number;
  style?: StyleProp<ViewStyle>;
  renderCell?: (
    value: any,
    checked: boolean,
    onPress: (value: any) => void,
  ) => React.ReactNode;
  onValueSelected?(index: number, value: any): void;
}

export const ValueSelector = ({
  values,
  onValueSelected,
  initialIndex = -1,
  style,
  renderCell,
}: Props) => {
  const [selected, setSelected] = useState(initialIndex);

  const handleValuePress = useCallback(
    (value: AwaitValue) => {
      const idx = values.indexOf(value);
      Logger.log('ValueSelector', 'handleValuePress', idx, {value});
      if (idx > -1) {
        setSelected(idx);
        onValueSelected?.(idx, value);
      }
    },
    [onValueSelected, selected],
  );

  return (
    <PopupContainer style={style}>
      {values?.map?.((value, idx) => {
        return typeof renderCell === 'function' ? (
          renderCell(value, idx === selected, v => handleValuePress(v))
        ) : (
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
