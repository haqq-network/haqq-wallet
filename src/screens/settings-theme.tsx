import React from 'react';

import {SettingsTheme} from '../components/settings-theme/settings-theme';
import {useUser} from '../hooks/use-user';
import {AppTheme} from '../types';

export const SettingsThemeScreen = () => {
  const user = useUser();

  const updateTheme = (theme: AppTheme) => {
    user.theme = theme;
  };

  return <SettingsTheme theme={user.theme} onChangeTheme={updateTheme} />;
};
