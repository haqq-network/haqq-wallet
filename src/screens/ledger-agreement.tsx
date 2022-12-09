import React, {useCallback} from 'react';

import {useTypedNavigation} from '@app/hooks';

import {LedgerAgreement} from '../components/ledger-agreement';

export const LedgerAgreementScreen = () => {
  const navigation = useTypedNavigation();
  const onDone = useCallback(() => {
    navigation.navigate('ledgerBluetooth');
  }, [navigation]);

  return <LedgerAgreement onDone={onDone} />;
};
