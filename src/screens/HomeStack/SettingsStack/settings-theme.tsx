import React, {memo, useCallback, useState} from 'react';

import {SettingsTheme} from '@app/components/settings/settings-theme';
import {app} from '@app/contexts';
import {useTypedNavigation} from '@app/hooks';
import {AppTheme} from '@app/types';

export const SettingsThemeScreen = memo(() => {
  const navigation = useTypedNavigation();
  const [theme, setTheme] = useState(app.theme);
  const onChangeTheme = useCallback((newTheme: AppTheme) => {
    app.theme = newTheme;
    setTheme(newTheme);
  }, []);

  return (
    <SettingsTheme
      goBack={navigation.goBack}
      theme={theme}
      onChangeTheme={onChangeTheme}
    />
  );
});
