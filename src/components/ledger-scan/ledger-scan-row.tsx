import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {Device} from 'react-native-ble-plx';
import {LIGHT_BG_3} from '../../variables';
import {Text} from '../ui';

export type LedgerScanRowProps = {
  item: Device;
  onPress: (item: Device) => void;
};

export const LedgerScanRow = ({item, onPress}: LedgerScanRowProps) => {
  return (
    <TouchableOpacity onPress={() => onPress(item)}>
      <Text style={page.container} t11>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

const page = StyleSheet.create({
  container: {
    backgroundColor: LIGHT_BG_3,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 6,
    overflow: 'hidden',
  },
});
