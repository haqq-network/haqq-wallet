import React, {useCallback} from 'react';

import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {requestLocationPermission} from '@app/helpers/request-location-permission';
import {useTypedNavigation} from '@app/hooks';

import {LedgerAgreement} from '../components/ledger-agreement';

export const LedgerAgreementScreen = () => {
  const navigation = useTypedNavigation();
  const onDone = useCallback(async () => {
    const {granted} = await requestLocationPermission();

    if (granted || !app.bluetooth) {
      navigation.navigate(app.bluetooth ? 'ledgerScan' : 'ledgerBluetooth');
    } else {
      showModal('locationUnauthorized');
    }
  }, [navigation]);

  return <LedgerAgreement onDone={onDone} />;
};
