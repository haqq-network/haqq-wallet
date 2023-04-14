import {useEffect, useState} from 'react';

import {Appearance} from 'react-native';

import {app} from '../contexts/app';

export function useTheme() {
  const [theme, setTheme] = useState(app.getTheme());

  useEffect(() => {
    const subscription = () => {
      if (theme !== app.getTheme()) {
        setTheme(app.getTheme());

        console.log('theme changed', app.getTheme());
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
