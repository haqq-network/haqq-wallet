import React, {useState} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';
import {Alert, StyleSheet, View} from 'react-native';

import {ActionsSheet} from '../components/actions-sheet';
import {
  Button,
  ButtonVariant,
  CustomHeader,
  Icon,
  IconButton,
  Input,
  KeyboardSafeArea,
} from '../components/ui';
import {useContacts} from '../contexts/contacts';
import {useTypedNavigation} from '../hooks';
import {I18N, getText} from '../i18n';
import {RootStackParamList} from '../types';
import {
  LIGHT_BG_7,
  LIGHT_GRAPHIC_BASE_1,
  LIGHT_GRAPHIC_BASE_2,
  LIGHT_GRAPHIC_GREEN_1,
} from '../variables';

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

  const onChange = (e: string) => {
    setInputName(e);
  };

  const cleanTextFile = () => {
    setInputName('');
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

  const onPressKeepEditing = () => setActionSheetVisible(false);

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
      <KeyboardSafeArea style={page.container}>
        <Input
          onChangeText={onChange}
          label={getText(I18N.name)}
          editable={isEdit}
          value={inputName}
          rightAction={
            inputName &&
            isEdit && (
              <IconButton onPress={cleanTextFile}>
                <Icon s name="close_circle" color={LIGHT_GRAPHIC_BASE_2} />
              </IconButton>
            )
          }
        />
        <View style={page.spaceInput} />
        <Input
          multiline
          label={getText(I18N.address)}
          editable={false}
          value={address}
        />
        <View style={page.buttonContainer}>
          {isEdit && !isCreate && (
            <Button
              variant={ButtonVariant.error}
              style={page.errorButton}
              onPress={onRemove}
              title={getText(I18N.settingsContactEditDeleteContact)}
            />
          )}
        </View>
      </KeyboardSafeArea>
      {actionSheetVisible && (
        <ActionsSheet
          onPressKeepEditing={onPressKeepEditing}
          onPressDiscard={onPressDiscard}
        />
      )}
    </>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 12,
  },
  spaceInput: {height: 24},
  buttonContainer: {
    alignSelf: 'flex-start',
    marginTop: 24,
  },
  errorButton: {
    backgroundColor: LIGHT_BG_7,
    borderRadius: 12,
  },
});
