import React, {useState} from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';
import {Alert, StyleSheet, View} from 'react-native';

import {ActionsSheet} from '../components/actions-sheet';
import {CustomHeader} from '../components/custom-header';
import {
  Button,
  ButtonVariant,
  Icon,
  IconButton,
  Input,
  KeyboardSafeArea,
} from '../components/ui';
import {useAddressBookItemActions} from '../hooks';
import {RootStackParamList} from '../types';
import {
  LIGHT_BG_7,
  LIGHT_GRAPHIC_BASE_1,
  LIGHT_GRAPHIC_BASE_2,
  LIGHT_GRAPHIC_GREEN_1,
} from '../variables';

export const SettingsEditContactScreen = () => {
  const {name, address, isCreate} =
    useRoute<RouteProp<RootStackParamList, 'settingsEditContact'>>().params;

  const {contacts, navigation} = useAddressBookItemActions();

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
    navigation.goBack();
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
      navigation.goBack();
    } else if (isChanged) {
      setActionSheetVisible(true);
    } else {
      navigation.goBack();
    }
  };
  const onPressDiscard = () => {
    setActionSheetVisible(false);
    navigation.goBack();
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
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <>
      <CustomHeader
        title="Contact"
        onPressLeft={onPressLeft}
        renderIconLeft={
          isEdit
            ? undefined
            : () => <Icon s name="arrowBack" color={LIGHT_GRAPHIC_BASE_1} />
        }
        textLeft={'Cancel'}
        textRight={isEdit ? 'Save' : 'Edit'}
        disabledRight={!isChanged && isEdit}
        onPressRight={onPressRight}
        textColorRight={LIGHT_GRAPHIC_GREEN_1}
        textColorLeft={LIGHT_GRAPHIC_GREEN_1}
      />
      <KeyboardSafeArea>
        <View style={page.container}>
          <Input
            onChangeText={onChange}
            label="Name"
            editable={isEdit}
            value={inputName}
            rightAction={
              inputName &&
              isEdit && (
                <IconButton onPress={cleanTextFile}>
                  <Icon s name="closeCircle" color={LIGHT_GRAPHIC_BASE_2} />
                </IconButton>
              )
            }
          />
          <View style={page.spaceInput} />
          <Input multiline label="Address" editable={false} value={address} />
          <View style={page.buttonContainer}>
            {isEdit && !isCreate && (
              <Button
                variant={ButtonVariant.error}
                style={page.errorButton}
                onPress={onRemove}
                title="Delete Contact"
              />
            )}
          </View>
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
