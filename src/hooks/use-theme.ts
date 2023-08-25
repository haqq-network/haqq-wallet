import {useEffect, useState} from 'react';

import {app} from '@app/contexts/app';
import {Events} from '@app/events';

export function useTheme() {
  const [theme, setTheme] = useState(app.currentTheme);

  useEffect(() => {
    const subscription = () => {
      if (theme !== app.currentTheme) {
        setTheme(app.currentTheme);
      }
    };

    app.on(Events.onThemeChanged, subscription);

    return () => {
      app.off(Events.onThemeChanged, subscription);
    };
  }, [theme]);

  return theme;
}
