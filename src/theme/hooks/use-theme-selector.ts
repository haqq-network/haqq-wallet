import {useMemo} from 'react';

import {AppTheme, Theme} from '@app/theme';

export interface ThemeSelectorParams<T> {
  dark: T;
  light: T;
}

export const useThemeSelector = <T>({
  dark,
  light,
}: ThemeSelectorParams<T>): T => {
  return useMemo(() => {
    if (Theme.currentTheme === AppTheme.dark) {
      return dark;
    }

    return light;
  }, [dark, light, Theme.currentTheme]);
};
