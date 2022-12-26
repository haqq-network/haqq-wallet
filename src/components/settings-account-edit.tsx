import React from 'react';

import {StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {ActionsSheet} from '@app/components/actions-sheet';
import {
  CustomHeader,
  Icon,
  IconButton,
  Input,
  KeyboardSafeArea,
} from '@app/components/ui';
import {I18N} from '@app/i18n';

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
        title={I18N.settingsAccountEditHeaderTitle}
        onPressLeft={onPressLeft}
        i18nTextLeft={I18N.cancel}
        i18nTextRight={I18N.save}
        disabledRight={!isChanged}
        onPressRight={onPressRight}
        colorRight={Color.graphicGreen1}
        colorLeft={Color.graphicGreen1}
      />
      <KeyboardSafeArea style={page.container}>
        <Input
          onChangeText={onChange}
          i18nLabel={I18N.name}
          value={inputName}
          rightAction={
            inputName && (
              <IconButton onPress={cleanTextFile}>
                <Icon i24 name="close_circle" color={Color.graphicBase2} />
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
