import React, {useCallback} from 'react';

import {showModal} from '@app/helpers';
import {requestLocationPermission} from '@app/helpers/request-location-permission';
import {useTypedNavigation, useUser} from '@app/hooks';

import {LedgerAgreement} from '../components/ledger-agreement';

export const LedgerAgreementScreen = () => {
  const navigation = useTypedNavigation();
  const user = useUser();
  const onDone = useCallback(async () => {
    const {granted} = await requestLocationPermission();

    if (granted || !user.bluetooth) {
      navigation.navigate(user.bluetooth ? 'ledgerScan' : 'ledgerBluetooth');
    } else {
      showModal('location-unauthorized');
    }
  }, [navigation, user.bluetooth]);

  return <LedgerAgreement onDone={onDone} />;
};
