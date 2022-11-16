import React from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {SettingsAddressBookEdit} from '@app/components/settings-address-book-edit';
import {useContacts, useTypedNavigation} from '@app/hooks';
import {RootStackParamList} from '@app/types';

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
