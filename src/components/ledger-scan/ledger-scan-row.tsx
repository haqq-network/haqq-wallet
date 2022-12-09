import React from 'react';

import {StyleSheet, TouchableOpacity} from 'react-native';
import {Device} from 'react-native-ble-plx';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';

export type LedgerScanRowProps = {
  item: Device;
  onPress: (item: Device) => void;
};

export const LedgerScanRow = ({item, onPress}: LedgerScanRowProps) => {
  return (
    <TouchableOpacity onPress={() => onPress(item)}>
      <Text color={Color.bg3} style={style.textName} t11>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

const style = StyleSheet.create({
  textName: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 6,
    overflow: 'hidden',
  },
});
