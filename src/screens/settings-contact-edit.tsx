import React, {useState} from 'react';

import {Alert} from 'react-native';

import {SettingsContactEdit} from '@app/components/settings-contact-edit';
import {useContacts, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';

export const SettingsContactEditScreen = () => {
  const {name, address, isCreate} =
    useTypedRoute<'settingsContactEdit'>().params;
  const contacts = useContacts();
  const {goBack} = useTypedNavigation();
  const [inputName, setInputName] = useState(name);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const onRemove = () => {
    const delateContact = getText(I18N.settingsContactEditDeleteContact);
    const sure = getText(I18N.settingsContactEditSure);
    const deleteWord = getText(I18N.settingsContactEditDelete);
    const cancel = getText(I18N.cancel);
    Alert.alert(delateContact, sure, [
      {text: cancel, style: 'cancel'},
      {
        text: deleteWord,
        style: 'destructive',
        onPress: () => {
          contacts.removeContact(address);
          goBack();
        },
      },
    ]);
  };

  const onSubmit = (newName?: string) => {
    if (isCreate) {
      contacts.createContact(address, newName || inputName);
    } else {
      contacts.updateContact(address, newName || inputName);
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
};
