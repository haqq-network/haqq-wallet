import React, {memo, useMemo, useState} from 'react';

import {Alert} from 'react-native';

import {SettingsContactEdit} from '@app/components/settings-contact-edit';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Contact, ContactType} from '@app/models/contact';
import {
  AddressBookParamList,
  AddressBookStackRoutes,
} from '@app/screens/HomeStack/AddressStack';

export const SettingsContactEditScreen = memo(() => {
  const {name, address, isCreate} = useTypedRoute<
    AddressBookParamList,
    AddressBookStackRoutes.SettingsContactEdit
  >().params;
  const contact = useMemo(() => Contact.getById(address), [address]);
  const {goBack} = useTypedNavigation();
  const [inputName, setInputName] = useState(name);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const onRemove = () => {
    const deleteContact = getText(I18N.settingsContactEditDeleteContact);
    const sure = getText(I18N.settingsContactEditSure);
    const deleteWord = getText(I18N.settingsContactEditDelete);
    const cancel = getText(I18N.cancel);
    Alert.alert(deleteContact, sure, [
      {text: cancel, style: 'cancel'},
      {
        text: deleteWord,
        style: 'destructive',
        onPress: () => {
          Contact.remove(address);
          goBack();
        },
      },
    ]);
  };

  const onSubmit = (newName?: string) => {
    if (!contact) {
      Contact.create(address, {
        name: newName || inputName,
        type: ContactType.address,
        visible: true,
      });
    } else {
      contact.update({
        name: newName || inputName,
      });
    }
    goBack();
  };

  const onPressDiscard = () => {
    setActionSheetVisible(false);
    goBack();
  };

  return (
    <SettingsContactEdit
      onRemove={onRemove}
      onSubmit={onSubmit}
      isCreate={isCreate}
      name={name}
      onPressDiscard={onPressDiscard}
      goBack={goBack}
      address={address}
      setInputName={setInputName}
      actionSheetVisible={actionSheetVisible}
      setActionSheetVisible={setActionSheetVisible}
    />
  );
});
