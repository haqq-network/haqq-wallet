import React from 'react';

import {TouchableOpacity} from 'react-native';
import {Device} from 'react-native-ble-plx';

import {Color} from '../../colors';
import {createTheme} from '../../helpers/create-theme';
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

const page = createTheme({
  container: {
    backgroundColor: Color.bg3,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 6,
    overflow: 'hidden',
  },
});
