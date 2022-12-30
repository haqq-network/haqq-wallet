import React from 'react';

import {ThemeNameType} from '@app/colors';
import {SettingsTheme} from '@app/components/settings-theme';
import {useTheme} from '@app/hooks';

export const SettingsThemeScreen = () => {
  const {enableSystemTheme, toggleTheme, name, isSystem} = useTheme();

  const updateTheme = (theme: ThemeNameType | 'system') => {
    if (theme === 'system') {
      enableSystemTheme();
    } else {
      toggleTheme(theme);
    }
  };

  return (
    <SettingsTheme
      theme={isSystem ? 'system' : name}
      onChangeTheme={updateTheme}
    />
  );
};
