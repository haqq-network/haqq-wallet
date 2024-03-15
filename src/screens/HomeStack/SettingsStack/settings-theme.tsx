import React, {useCallback} from 'react';

import {observer} from 'mobx-react';

import {SettingsTheme} from '@app/components/settings/settings-theme';
import {useTypedNavigation} from '@app/hooks';
import {AppTheme, Theme} from '@app/theme';

export const SettingsThemeScreen = observer(() => {
  const navigation = useTypedNavigation();
  const onChangeTheme = useCallback((newTheme: AppTheme) => {
    Theme.currentTheme = newTheme;
  }, []);

  return (
    <SettingsTheme
      goBack={navigation.goBack}
      theme={Theme.currentSelectedTheme}
      onChangeTheme={onChangeTheme}
    />
  );
});
