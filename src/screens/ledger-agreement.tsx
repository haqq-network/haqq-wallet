import React, {useCallback} from 'react';

import {useTypedNavigation, useUser} from '@app/hooks';

import {LedgerAgreement} from '../components/ledger-agreement';

export const LedgerAgreementScreen = () => {
  const navigation = useTypedNavigation();
  const user = useUser();
  const onDone = useCallback(() => {
    navigation.navigate(user.bluetooth ? 'ledgerScan' : 'ledgerBluetooth');
  }, [navigation, user.bluetooth]);

  return <LedgerAgreement onDone={onDone} />;
};
