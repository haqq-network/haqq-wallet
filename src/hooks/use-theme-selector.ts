import {useMemo} from 'react';

import {AppTheme} from '@app/types';

import {useTheme} from './use-theme';

export interface ThemeSelectorParams<T> {
  dark: T;
  light: T;
}

export const useThemeSelector = <T>({
  dark,
  light,
}: ThemeSelectorParams<T>): T => {
  const theme = useTheme();

  return useMemo(() => {
    if (theme === AppTheme.dark) {
      return dark;
    }

    return light;
  }, [dark, light, theme]);
};
