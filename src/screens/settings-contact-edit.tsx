import React, {useState} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';
import {Alert} from 'react-native';

import {ActionsSheet} from '@app/components/actions-sheet';
import {SettingsAddressBookEdit} from '@app/components/settings-address-book-edit';
import {CustomHeader} from '@app/components/ui';
import {useContacts, useTypedNavigation} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {RootStackParamList} from '@app/types';
import {LIGHT_GRAPHIC_GREEN_1} from '@app/variables';

export const SettingsContactEditScreen = () => {
  const {name, address, isCreate} =
    useRoute<RouteProp<RootStackParamList, 'settingsContactEdit'>>().params;
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
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete the selected contact?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            contacts.removeContact(address);
            goBack();
          },
        },
      ],
    );
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
        title={getText(I18N.settingsContactEditHeaderTitle)}
        onPressLeft={onPressLeft}
        iconLeft={isEdit ? undefined : 'arrow_back'}
        textLeft={getText(I18N.cancel)}
        textRight={isEdit ? getText(I18N.save) : getText(I18N.edit)}
        disabledRight={!isChanged && isEdit}
        onPressRight={onPressRight}
        colorRight={LIGHT_GRAPHIC_GREEN_1}
        colorLeft={LIGHT_GRAPHIC_GREEN_1}
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
