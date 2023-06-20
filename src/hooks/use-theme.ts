import {useEffect, useState} from 'react';

import {Appearance} from 'react-native';

import {app} from '@app/contexts/app';

export function useTheme() {
  const [theme, setTheme] = useState(app.currentTheme);

  useEffect(() => {
    const subscription = () => {
      if (theme !== app.currentTheme) {
        setTheme(app.currentTheme);
      }
    };

    const {remove} = Appearance.addChangeListener(subscription);
    app.on('theme', subscription);

    return () => {
      remove?.();
      app.off('theme', subscription);
    };
  }, [theme]);

  return theme;
}
