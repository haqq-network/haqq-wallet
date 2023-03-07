import React, {useCallback} from 'react';

import {Device} from '@haqq/provider-ledger-react-native';
import {ActivityIndicator, TouchableOpacity} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';

export type LedgerScanRowProps = {
  item: Device;
  loading?: boolean;
  error?: boolean;
  onPress: (item: Device) => void;
};

export const LedgerScanRow = ({
  item,
  onPress,
  loading,
  error,
}: LedgerScanRowProps) => {
  const disabled = !!loading && !error;
  const handlePress = useCallback(() => {
    onPress?.(item);
  }, [item, onPress]);

  return (
    <TouchableOpacity
      disabled={disabled}
      style={styles.container}
      onPress={handlePress}>
      <Text style={styles.textName} t11>
        {item.name}
      </Text>

      {disabled && <ActivityIndicator />}
    </TouchableOpacity>
  );
};

const styles = createTheme({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 6,
    overflow: 'hidden',
    backgroundColor: Color.bg3,
  },
  textName: {
    overflow: 'hidden',
  },
});
