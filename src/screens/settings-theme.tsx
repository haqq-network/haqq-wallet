import React from 'react';

import {SettingsTheme} from '@app/components/settings-theme';
import {useUser} from '@app/hooks';
import {AppTheme} from '@app/types';

export const SettingsThemeScreen = () => {
  const user = useUser();

  const updateTheme = (theme: AppTheme) => {
    user.theme = theme;
  };

  return <SettingsTheme theme={user.theme} onChangeTheme={updateTheme} />;
};
