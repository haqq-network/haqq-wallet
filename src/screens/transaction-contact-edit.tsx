import React from 'react';

import {SettingsAddressBookEdit} from '@app/components/settings-address-book-edit';
import {useContacts, useTypedNavigation, useTypedRoute} from '@app/hooks';

export const TransactionContactEditScreen = () => {
  const {name, address} =
    useTypedRoute<'transactionContactEdit'>().params;
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
