import React, {useCallback, useState} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';

import {ActionsSheet} from '../components/actions-sheet';
import {SettingsAddressBookEdit} from '../components/settings-address-book-edit';
import {CustomHeader, Icon} from '../components/ui';
import {useContacts} from '../contexts/contacts';
import {useTypedNavigation} from '../hooks';
import {I18N, getText} from '../i18n';
import {RootStackParamList} from '../types';
import {LIGHT_GRAPHIC_BASE_1, LIGHT_GRAPHIC_GREEN_1} from '../variables';

export const SettingsContactEditScreen = () => {
  const {name, address, isCreate} =
    useRoute<RouteProp<RootStackParamList, 'settingsContactEdit'>>().params;
  const contacts = useContacts();
  const {goBack} = useTypedNavigation();

  const [inputName, setInputName] = useState(name);
  const [isEdit, setIsEdit] = useState(!!isCreate);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const isChanged = inputName !== name;

  const onSubmit = () => {
    if (isCreate) {
      contacts.createContact(address, inputName);
    } else {
      contacts.updateContact(address, inputName);
    }
    goBack();
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
  const onChangeAddress = useCallback((text: string) => {
    setInputName(text);
  }, []);

  const onPressKeepEditing = () => setActionSheetVisible(false);

  return (
    <>
      <CustomHeader
        title={getText(I18N.settingsContactEditHeaderTitle)}
        onPressLeft={onPressLeft}
        renderIconLeft={
          isEdit
            ? undefined
            : () => <Icon s name="arrow_back" color={LIGHT_GRAPHIC_BASE_1} />
        }
        textLeft={getText(I18N.cancel)}
        textRight={isEdit ? getText(I18N.save) : getText(I18N.edit)}
        disabledRight={!isChanged && isEdit}
        onPressRight={onPressRight}
        textColorRight={LIGHT_GRAPHIC_GREEN_1}
        textColorLeft={LIGHT_GRAPHIC_GREEN_1}
      />
      <SettingsAddressBookEdit
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
