import React, {useCallback} from 'react';

import {Device} from '@haqq/provider-ledger-react-native';
import {FlatList, ListRenderItem} from 'react-native';

import {PopupContainer} from '@app/components/ui';

import {LedgerScanEmpty} from './ledger-scan-empty';
import {LedgerScanHeader} from './ledger-scan-header';
import {LedgerScanRow} from './ledger-scan-row';

export type LedgerScanProps = {
  onSelect: (device: Device) => void;
  devices: Device[];
  refreshing: boolean;
  devicesLoadingMap: Record<string, boolean>;
  devicesErrorMap: Record<string, string | undefined>;
};

export const LedgerScan = ({
  onSelect,
  devices,
  refreshing,
  devicesLoadingMap,
  devicesErrorMap,
}: LedgerScanProps) => {
  const onPress = useCallback(
    (item: Device) => {
      onSelect(item);
    },
    [onSelect],
  );

  const renderItem: ListRenderItem<Device> = useCallback(
    ({item}) => {
      const isLoading = !!devicesLoadingMap[item.id];
      const isError = !!devicesErrorMap[item.id];

      return (
        <LedgerScanRow
          loading={isLoading}
          error={isError}
          item={item}
          onPress={onPress}
        />
      );
    },
    [devicesErrorMap, devicesLoadingMap, onPress],
  );

  return (
    <PopupContainer plain>
      <FlatList
        data={devices}
        ListEmptyComponent={LedgerScanEmpty}
        ListHeaderComponent={LedgerScanHeader}
        renderItem={renderItem}
        refreshing={refreshing}
      />
    </PopupContainer>
  );
};
