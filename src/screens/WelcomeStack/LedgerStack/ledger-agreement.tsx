import React, {memo, useCallback} from 'react';

import {LedgerAgreement} from '@app/components/ledger-agreement';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {requestLocationPermission} from '@app/helpers/request-location-permission';
import {useTypedNavigation} from '@app/hooks';
import {
  LedgerStackParamList,
  LedgerStackRoutes,
} from '@app/screens/WelcomeStack/LedgerStack';

export const LedgerAgreementScreen = memo(() => {
  const navigation = useTypedNavigation<LedgerStackParamList>();
  const onDone = useCallback(async () => {
    const {granted} = await requestLocationPermission();

    if (granted || !app.bluetooth) {
      navigation.navigate(
        app.bluetooth
          ? LedgerStackRoutes.LedgerScan
          : LedgerStackRoutes.LedgerBluetooth,
      );
    } else {
      showModal('locationUnauthorized');
    }
  }, [navigation]);

  return <LedgerAgreement onDone={onDone} />;
});
