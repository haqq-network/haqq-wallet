import React, {memo, useState} from 'react';

import {Alert, StyleSheet, View} from 'react-native';

import {
  Button,
  ButtonVariant,
  Icon,
  IconButton,
  Input,
  KeyboardSafeArea,
} from './ui';

import {useContacts} from '../contexts/contacts';
import {useTypedNavigation} from '../hooks';
import {I18N, getText} from '../i18n';
import {LIGHT_BG_7, LIGHT_GRAPHIC_BASE_2} from '../variables';

interface SettingsAddressBookEditProps {
  initName?: string;
  initAddress?: string;
  buttonType?: 'save' | 'del';
  isCreate?: boolean;
  isEdit?: boolean;
  onChangeAddress?: (text: string) => void;
}

export const SettingsAddressBookEdit = memo(
  ({
    initAddress = '',
    initName = '',
    buttonType = 'save',
    isCreate = false,
    isEdit,
    onChangeAddress,
  }: SettingsAddressBookEditProps) => {
    const {goBack} = useTypedNavigation();

    const contacts = useContacts();
    const [inputName, setInputName] = useState(initName);

    const onSubmit = () => {
      if (isCreate) {
        contacts.createContact(initAddress, inputName);
      } else {
        contacts.updateContact(initAddress, inputName);
      }
      goBack();
    };

    const onChange = (e: string) => {
      onChangeAddress?.(e);
      setInputName(e);
    };

    const cleanTextFile = () => setInputName('');

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
              contacts.removeContact(initAddress);
              goBack();
            },
          },
        ],
      );
    };

    return (
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
          value={initAddress}
        />
        {buttonType === 'save' ? (
          <View style={page.buttonContainer}>
            <Button
              disabled={initName === inputName}
              title={getText(I18N.continue)}
              onPress={onSubmit}
              variant={ButtonVariant.contained}
            />
          </View>
        ) : (
          <View style={page.buttonContainerRemove}>
            {isEdit && !isCreate && (
              <Button
                variant={ButtonVariant.error}
                style={page.errorButton}
                onPress={onRemove}
                title={getText(I18N.settingsContactEditDeleteContact)}
              />
            )}
          </View>
        )}
      </KeyboardSafeArea>
    );
  },
);

const page = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 12,
  },
  spaceInput: {height: 24},
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  buttonContainerRemove: {
    alignSelf: 'flex-start',
    marginTop: 24,
  },
  errorButton: {
    backgroundColor: LIGHT_BG_7,
    borderRadius: 12,
  },
});
