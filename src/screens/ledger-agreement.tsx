import React, {useCallback} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {LedgerAgreement} from '../components/ledger-agreement';
import {RootStackParamList} from '../types';

export const LedgerAgreementScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const onDone = useCallback(() => {
    navigation.navigate('ledgerBluetooth');
  }, [navigation]);

  return <LedgerAgreement onDone={onDone} />;
};
