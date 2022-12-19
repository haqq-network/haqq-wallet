import React, {useMemo} from 'react';

import {SettingsAddressBookEdit} from '@app/components/settings-address-book-edit';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Contact} from '@app/models/contact';

export const TransactionContactEditScreen = () => {
  const {name, address} = useTypedRoute<'transactionContactEdit'>().params;
  const contact = useMemo(() => Contact.getById(address), [address]);
  const {goBack} = useTypedNavigation();

  const onSubmit = (newName: string) => {
    contact?.update({name: newName});
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
