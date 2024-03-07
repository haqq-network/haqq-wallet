import React, {memo, useCallback} from 'react';

import {AppTheme, Theme} from '@theme';

import {SettingsTheme} from '@app/components/settings/settings-theme';
import {useTypedNavigation} from '@app/hooks';

export const SettingsThemeScreen = memo(() => {
  const navigation = useTypedNavigation();
  const onChangeTheme = useCallback((newTheme: AppTheme) => {
    Theme.currentTheme = newTheme;
  }, []);

  return (
    <SettingsTheme
      goBack={navigation.goBack}
      theme={Theme.currentTheme}
      onChangeTheme={onChangeTheme}
    />
  );
});
