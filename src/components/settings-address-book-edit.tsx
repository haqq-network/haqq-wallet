import React, {memo, useState} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
  IconButton,
  Input,
  KeyboardSafeArea,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';

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
      <KeyboardSafeArea style={styles.container}>
        <Input
          onChangeText={onChange}
          i18nLabel={I18N.name}
          placeholder={getText(I18N.settingsContactEditNamePlaceholder)}
          editable={isEdit}
          value={inputName}
          rightAction={
            inputName &&
            isEdit && (
              <IconButton onPress={cleanTextFile}>
                <Icon i24 name="close_circle" color={Color.graphicBase2} />
              </IconButton>
            )
          }
        />
        <View style={styles.spaceInput} />
        <Input
          multiline
          i18nLabel={I18N.address}
          editable={false}
          value={initAddress}
        />
        {buttonType === 'save' ? (
          <View style={styles.buttonContainer}>
            <Button
              disabled={initName === inputName}
              i18n={I18N.continue}
              onPress={handleSubmit}
              variant={ButtonVariant.contained}
            />
          </View>
        ) : (
          <View style={styles.buttonContainerRemove}>
            {isEdit && !isCreate && (
              <Button
                error
                variant={ButtonVariant.second}
                size={ButtonSize.middle}
                onPress={handleRemove}
                i18n={I18N.settingsContactEditDeleteContact}
              />
            )}
          </View>
        )}
      </KeyboardSafeArea>
    );
  },
);

const styles = createTheme({
  container: {
    flex: 1,
    paddingHorizontal: 20,
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
});
