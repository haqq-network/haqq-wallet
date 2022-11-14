import React, {memo, useState} from 'react';

import {StyleSheet, View} from 'react-native';

import {
  Button,
  ButtonVariant,
  Icon,
  IconButton,
  Input,
  KeyboardSafeArea,
} from './ui';

import {I18N, getText} from '../i18n';
import {LIGHT_BG_7, LIGHT_GRAPHIC_BASE_2} from '../variables';

interface SettingsAddressBookEditProps {
  initName?: string;
  initAddress?: string;
  buttonType?: 'save' | 'del';
  isCreate?: boolean;
  isEdit?: boolean;
  onChangeAddress?: (text: string) => void;
  onSubmit?: (name: string) => void;
  onRemove?: () => void;
}

export const SettingsAddressBookEdit = memo(
  ({
    initAddress = '',
    initName = '',
    buttonType = 'save',
    isCreate = false,
    isEdit,
    onSubmit,
    onRemove,
    onChangeAddress,
  }: SettingsAddressBookEditProps) => {
    const [inputName, setInputName] = useState(initName);

    const handleSubmit = () => onSubmit?.(inputName);

    const onChange = (e: string) => {
      onChangeAddress?.(e);
      setInputName(e);
    };

    const cleanTextFile = () => setInputName('');

    const handleRemove = () => onRemove?.();

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
              onPress={handleSubmit}
              variant={ButtonVariant.contained}
            />
          </View>
        ) : (
          <View style={page.buttonContainerRemove}>
            {isEdit && !isCreate && (
              <Button
                variant={ButtonVariant.error}
                style={page.errorButton}
                onPress={handleRemove}
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
