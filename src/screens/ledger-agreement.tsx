import React, {memo, useCallback} from 'react';

import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {requestLocationPermission} from '@app/helpers/request-location-permission';
import {useTypedNavigation} from '@app/hooks';
import {
  LedgerStackParamList,
  LedgerStackRoutes,
} from '@app/screens/WelcomeStack/LedgerStack';

import {LedgerAgreement} from '../components/ledger-agreement';

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
