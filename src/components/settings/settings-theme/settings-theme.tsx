import React from 'react';

import {ThemedButton} from '@app/components/settings/settings-theme/theme-button';
import {CustomHeader, PopupContainer} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {AppTheme, createTheme} from '@app/theme';

export type SettingsThemeProps = {
  theme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
  goBack: () => void;
};

export const SettingsTheme = ({
  theme,
  onChangeTheme,
  goBack,
}: SettingsThemeProps) => {
  return (
    <>
      <CustomHeader
        onPressLeft={goBack}
        iconLeft="arrow_back"
        title={I18N.settingsThemeScreen}
      />
      <PopupContainer style={styles.container}>
        <ThemedButton
          value={AppTheme.system}
          name={I18N.settingsThemeSystem}
          active={theme === AppTheme.system}
          onChange={onChangeTheme}
        />
        <ThemedButton
          value={AppTheme.light}
          name={I18N.settingsThemeLight}
          active={theme === AppTheme.light}
          onChange={onChangeTheme}
        />
        <ThemedButton
          value={AppTheme.dark}
          name={I18N.settingsThemeDark}
          active={theme === AppTheme.dark}
          onChange={onChangeTheme}
        />
      </PopupContainer>
    </>
  );
};

const styles = createTheme({
  container: {
    marginHorizontal: 20,
  },
});
