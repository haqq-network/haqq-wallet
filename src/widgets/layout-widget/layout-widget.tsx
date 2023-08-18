import React, {ReactNode} from 'react';

import {StyleSheet, View} from 'react-native';

import {Spacer} from '@app/components/ui';
import {generateUUID} from '@app/utils';

type Props = {
  direction: 'horizontal' | 'vertical';
  children: ReactNode[];
  deep: boolean;
};

const LayoutWidget = ({direction, children, deep}: Props) => {
  return (
    <View
      style={[
        styles.wrapper,
        direction === 'horizontal' ? styles.row : styles.column,
        !!deep && styles.removeMargin,
      ]}>
      {children.map((child, index) => {
        if (index >= 0 && index < children.length - 1) {
          return [child, <Spacer key={generateUUID()} width={20} />];
        }
        return child;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  removeMargin: {marginHorizontal: 0},
  wrapper: {flex: 1, marginHorizontal: 20},
  row: {flexDirection: 'row'},
  column: {flexDirection: 'column'},
});

export {LayoutWidget};
