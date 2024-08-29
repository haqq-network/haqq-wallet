import React, {memo, useCallback} from 'react';

import {SettingsTheme} from '@app/components/settings/settings-theme';
import {app} from '@app/contexts';
import {useTypedNavigation} from '@app/hooks';
import {AppTheme} from '@app/types';

export const SettingsThemeScreen = memo(() => {
  const navigation = useTypedNavigation();
  const onChangeTheme = useCallback((newTheme: AppTheme) => {
    app.theme = newTheme;
  }, []);

  return (
    <SettingsTheme goBack={navigation.goBack} onChangeTheme={onChangeTheme} />
  );
});
