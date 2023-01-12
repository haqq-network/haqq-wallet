import React from 'react';

import {Device} from '@haqq/provider-ledger-react-native';
import {TouchableOpacity} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';

export type LedgerScanRowProps = {
  item: Device;
  onPress: (item: Device) => void;
};

export const LedgerScanRow = ({item, onPress}: LedgerScanRowProps) => {
  return (
    <TouchableOpacity onPress={() => onPress(item)}>
      <Text style={style.textName} t11>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

const style = createTheme({
  textName: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 6,
    overflow: 'hidden',
    backgroundColor: Color.bg3,
  },
});
