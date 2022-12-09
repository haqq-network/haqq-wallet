import React, {useState} from 'react';

import {Alert} from 'react-native';

import {Color} from '@app/colors';
import {ActionsSheet} from '@app/components/actions-sheet';
import {SettingsAddressBookEdit} from '@app/components/settings-address-book-edit';
import {CustomHeader} from '@app/components/ui';
import {useContacts, useTypedNavigation} from '@app/hooks';
import {useTypedRoute} from '@app/hooks/use-typed-route';
import {I18N, getText} from '@app/i18n';

export const SettingsContactEdit = () => {
  const {name, address, isCreate} =
    useTypedRoute<'settingsContactEdit'>().params;

  const contacts = useContacts();
  const {goBack} = useTypedNavigation();

  const [inputName, setInputName] = useState(name);
  const [isEdit, setIsEdit] = useState(!!isCreate);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const isChanged = inputName !== name;

  const onSubmit = (newName?: string) => {
    if (isCreate) {
      contacts.createContact(address, newName || inputName);
    } else {
      contacts.updateContact(address, newName || inputName);
    }
    goBack();
  };
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
  const onPressRight = () => {
    if (!isEdit) {
      setIsEdit(true);
    } else {
      onSubmit();
    }
  };

  const onPressLeft = () => {
    if (!isEdit) {
      goBack();
    } else if (isChanged) {
      setActionSheetVisible(true);
    } else {
      goBack();
    }
  };

  const onPressDiscard = () => {
    setActionSheetVisible(false);
    goBack();
  };
  const onChangeAddress = (text: string) => {
    setInputName(text);
  };

  const onPressKeepEditing = () => setActionSheetVisible(false);

  return (
    <>
      <CustomHeader
        i18nTitle={I18N.settingsContactEditHeaderTitle}
        onPressLeft={onPressLeft}
        iconLeft={isEdit ? undefined : 'arrow_back'}
        i18nTextLeft={I18N.cancel}
        i18nTextRight={isEdit ? I18N.save : I18N.edit}
        disabledRight={!isChanged && isEdit}
        onPressRight={onPressRight}
        colorRight={Color.graphicGreen1}
        colorLeft={Color.graphicGreen1}
      />
      <SettingsAddressBookEdit
        onSubmit={onSubmit}
        onRemove={onRemove}
        buttonType="del"
        isEdit={isEdit}
        isCreate={isCreate}
        onChangeAddress={onChangeAddress}
        initAddress={address}
        initName={name}
      />
      {actionSheetVisible && (
        <ActionsSheet
          onPressKeepEditing={onPressKeepEditing}
          onPressDiscard={onPressDiscard}
        />
      )}
    </>
  );
};
