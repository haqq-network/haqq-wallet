import React, {useCallback} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {LedgerAgreement} from '../components/ledger-agreement';

export const LedgerAgreementScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const onDone = useCallback(() => {
    navigation.navigate('ledgerBluetooth');
  }, [navigation]);

  return <LedgerAgreement onDone={onDone} />;
};
