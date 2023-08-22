import React, {memo, useMemo} from 'react';

import {SettingsAddressBookEdit} from '@app/components/settings-address-book-edit';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {Contact} from '@app/models/contact';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/screens/HomeStack/TransactionStack';

export const TransactionContactEditScreen = memo(() => {
  const {name, address} = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.TransactionContactEdit
  >().params;
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
});
