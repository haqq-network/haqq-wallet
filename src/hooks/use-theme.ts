import {useEffect, useState} from 'react';

import {Theme} from '@theme';

import {app} from '@app/contexts/app';
import {Events} from '@app/events';

export function useTheme() {
  const [theme, setTheme] = useState(Theme.currentTheme);

  useEffect(() => {
    const subscription = () => {
      if (theme !== Theme.currentTheme) {
        setTheme(Theme.currentTheme);
      }
    };

    app.on(Events.onThemeChanged, subscription);

    return () => {
      app.off(Events.onThemeChanged, subscription);
    };
  }, [theme]);

  return theme;
}
