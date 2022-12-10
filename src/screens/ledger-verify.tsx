import React, {useCallback} from 'react';

import {LedgerVerify} from '@app/components/ledger-verify';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const LedgerVerifyScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'ledgerVerify'>();

  const onDone = useCallback(
    (params: {address: string}) => {
      navigation.navigate(route.params.nextScreen ?? 'ledgerStore', {
        address: params.address,
        deviceId: route.params.deviceId,
        deviceName: route.params.deviceName,
      });
    },
    [
      route.params.deviceId,
      route.params.deviceName,
      route.params.nextScreen,
      navigation,
    ],
  );

  return (
    <LedgerVerify
      deviceId={route.params.deviceId}
      address={route.params.address}
      onDone={onDone}
    />
  );
};
