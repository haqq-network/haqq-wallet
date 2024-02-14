import React, {useCallback} from 'react';

import {DeviceSelect} from '@app/components/device-select';
import {useTypedNavigation} from '@app/hooks';
import {DeviceStackRoutes} from '@app/route-types';

export const DeviceSelectScreen = () => {
  const navigation = useTypedNavigation();

  const onPressLedger = useCallback(() => {
    navigation.navigate(DeviceStackRoutes.DeviceLedger);
  }, []);

  const onPressKeystone = useCallback(() => {
    navigation.navigate(DeviceStackRoutes.DeviceKeystone);
  }, []);

  return (
    <DeviceSelect
      onPressKeystone={onPressKeystone}
      onPressLedger={onPressLedger}
    />
  );
};
