import React from 'react';

import {StyleSheet} from 'react-native';

import {ActionsSheet} from '@app/components/actions-sheet';

import {
  CustomHeader,
  Icon,
  IconButton,
  Input,
  KeyboardSafeArea,
} from '../components/ui';
import {I18N, getText} from '../i18n';
import {LIGHT_GRAPHIC_BASE_2, LIGHT_GRAPHIC_GREEN_1} from '../variables';

interface SettingsAccountEditProps {
  actionSheetVisible: boolean;
  isChanged: boolean;
  inputName: string;
  onPressLeft: () => void;
  onPressRight: () => void;
  onChange: (e: string) => void;
  cleanTextFile: () => void;
  onPressKeepEditing: () => void;
  onPressDiscard: () => void;
}

export const SettingsAccountEdit = ({
  actionSheetVisible,
  isChanged,
  inputName,
  onPressLeft,
  onPressRight,
  onChange,
  cleanTextFile,
  onPressKeepEditing,
  onPressDiscard,
}: SettingsAccountEditProps) => {
  return (
    <>
      <CustomHeader
        title={getText(I18N.settingsAccountEditHeaderTitle)}
        onPressLeft={onPressLeft}
        textLeft={getText(I18N.cancel)}
        textRight={getText(I18N.save)}
        disabledRight={!isChanged}
        onPressRight={onPressRight}
        colorRight={LIGHT_GRAPHIC_GREEN_1}
        colorLeft={LIGHT_GRAPHIC_GREEN_1}
      />
      <KeyboardSafeArea style={page.container}>
        <Input
          onChangeText={onChange}
          label={getText(I18N.name)}
          value={inputName}
          rightAction={
            inputName && (
              <IconButton onPress={cleanTextFile}>
                <Icon s name="close_circle" color={LIGHT_GRAPHIC_BASE_2} />
              </IconButton>
            )
          }
        />
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
});
