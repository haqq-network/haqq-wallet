import React from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {SettingsAddressBookEdit} from '../components/settings-address-book-edit';
import {RootStackParamList} from '../types';

export const TransactionContactEditScreen = () => {
  const {name, address} =
    useRoute<RouteProp<RootStackParamList, 'transactionContactEdit'>>().params;

  return <SettingsAddressBookEdit initName={name} initAddress={address} />;
};
