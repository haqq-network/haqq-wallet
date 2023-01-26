import React, {useCallback} from 'react';

import {Device} from '@haqq/provider-ledger-react-native';
import {FlatList} from 'react-native';

import {PopupContainer} from '@app/components/ui';

import {LedgerScanEmpty} from './ledger-scan-empty';
import {LedgerScanHeader} from './ledger-scan-header';
import {LedgerScanRow} from './ledger-scan-row';

export type LedgerScanProps = {
  onSelect: (device: Device) => void;
  devices: Device[];
  refreshing: boolean;
};

export const LedgerScan = ({
  onSelect,
  devices,
  refreshing,
}: LedgerScanProps) => {
  const onPress = useCallback(
    (item: Device) => {
      onSelect(item);
    },
    [onSelect],
  );

  return (
    <PopupContainer plain>
      <FlatList
        data={devices}
        ListEmptyComponent={LedgerScanEmpty}
        ListHeaderComponent={LedgerScanHeader}
        renderItem={({item}) => <LedgerScanRow item={item} onPress={onPress} />}
        refreshing={refreshing}
      />
    </PopupContainer>
  );
};
