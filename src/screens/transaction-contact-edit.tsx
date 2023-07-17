import React, {useMemo} from 'react';

import {SettingsAddressBookEdit} from '@app/components/settings-address-book-edit';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {Contact} from '@app/models/contact';

export const TransactionContactEditScreen = () => {
  const {name, address} = useTypedRoute<'transactionContactEdit'>().params;
  const contact = useMemo(() => Contact.getById(address), [address]);
  const {goBack} = useTypedNavigation();
  useAndroidBackHandler(() => {
    goBack();
    return true;
  }, [goBack]);
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
