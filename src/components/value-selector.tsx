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
    idx: number,
    onPress: (value: any, idx: number) => void,
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
    (value: AwaitValue, idx: number) => {
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
          <React.Fragment key={value.id}>
            {renderCell(value, idx, (v, i) => handleValuePress(v, i))}
          </React.Fragment>
        ) : (
          <ValueRow
            key={value.id}
            item={value}
            hideArrow
            checked={idx === selected}
            onPress={v => handleValuePress(v, idx)}
          />
        );
      })}
    </PopupContainer>
  );
};
