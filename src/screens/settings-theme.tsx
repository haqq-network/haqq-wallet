import React, {useCallback, useState} from 'react';

import {SettingsTheme} from '@app/components/settings-theme';
import {app} from '@app/contexts';
import {AppTheme} from '@app/types';

export const SettingsThemeScreen = () => {
  const [theme, setTheme] = useState(app.theme);
  const onChangeTheme = useCallback((newTheme: AppTheme) => {
    app.theme = newTheme;
    setTheme(newTheme);
  }, []);

  return <SettingsTheme theme={theme} onChangeTheme={onChangeTheme} />;
};
