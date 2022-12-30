import React from 'react';

import {StyleSheet} from 'react-native';

import {ThemeNameType} from '@app/colors';
import {ThemedButton} from '@app/components/settings-theme/theme-button';
import {PopupContainer} from '@app/components/ui';
import {I18N} from '@app/i18n';

export type SettingsThemeProps = {
  theme: ThemeNameType | 'system';
  onChangeTheme: (theme: ThemeNameType | 'system') => void;
};

export const SettingsTheme = ({theme, onChangeTheme}: SettingsThemeProps) => {
  return (
    <PopupContainer style={styles.container}>
      <ThemedButton
        value={'light'}
        name={I18N.settingsThemeLight}
        active={theme === 'light'}
        onChange={onChangeTheme}
      />
      <ThemedButton
        value={'dark'}
        name={I18N.settingsThemeDark}
        active={theme === 'dark'}
        onChange={onChangeTheme}
      />
      <ThemedButton
        value={'system'}
        name={I18N.settingsThemeSystem}
        active={theme === 'system'}
        onChange={onChangeTheme}
      />
    </PopupContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
  },
});
