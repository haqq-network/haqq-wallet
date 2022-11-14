import React from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {SettingsAddressBookEdit} from '../components/settings-address-book-edit';
import {useContacts} from '../contexts/contacts';
import {useTypedNavigation} from '../hooks';
import {RootStackParamList} from '../types';

export const TransactionContactEditScreen = () => {
  const {name, address} =
    useRoute<RouteProp<RootStackParamList, 'transactionContactEdit'>>().params;
  const contacts = useContacts();
  const {goBack} = useTypedNavigation();

  const onSubmit = (newName: string) => {
    contacts.updateContact(address, newName);
    goBack();
  };

  return (
    <SettingsAddressBookEdit
      onSubmit={onSubmit}
      initName={name}
      initAddress={address}
    />
  );
};
