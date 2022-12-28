import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {createContext} from 'react';

import {useColorScheme} from 'react-native';

import {ThemeDictionary, ThemeNameType} from '@app/colors';
import {ThemeColorsType} from '@app/types';

interface ProvidedValue {
  colors: ThemeColorsType;
  name: ThemeNameType;
  isSystem: boolean;
  isDarkSystem: boolean;
  toggleTheme: (name: ThemeNameType) => void;
  enableSystemTheme: () => void;
}

export const ThemeContext = createContext<ProvidedValue>({
  colors: ThemeDictionary.light,
  name: 'light',
  isDarkSystem: false,
  isSystem: true,
  toggleTheme: () => {},
  enableSystemTheme: () => {},
});

type ThemeProviderProps = {children: JSX.Element};

export const ThemeProvider = ({children}: ThemeProviderProps) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeNameType>(colorScheme || 'light');

  const [isSystemTheme, setIsSystemTheme] = useState<boolean>(true);

  const toggleTheme = useCallback((name: ThemeNameType) => {
    setTheme(name);
    setIsSystemTheme(false);
  }, []);

  const enableSystemTheme = useCallback(() => setIsSystemTheme(true), []);

  useEffect(() => {
    if (colorScheme && isSystemTheme) {
      setTheme(colorScheme);
    }
  }, [isSystemTheme, colorScheme]);

  const providedValue = useMemo(() => {
    const value: ProvidedValue = {
      name: theme,
      isDarkSystem: colorScheme === 'dark',
      isSystem: isSystemTheme,
      colors: ThemeDictionary[theme],
      toggleTheme,
      enableSystemTheme,
    };
    return value;
  }, [theme, colorScheme, isSystemTheme, toggleTheme, enableSystemTheme]);

  return (
    <ThemeContext.Provider value={providedValue}>
      {children}
    </ThemeContext.Provider>
  );
};
