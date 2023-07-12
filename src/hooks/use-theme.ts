import {useEffect, useState} from 'react';

import {app} from '@app/contexts/app';

export function useTheme() {
  const [theme, setTheme] = useState(app.currentTheme);

  useEffect(() => {
    const subscription = () => {
      if (theme !== app.currentTheme) {
        setTheme(app.currentTheme);
      }
    };

    app.on('theme', subscription);

    return () => {
      app.off('theme', subscription);
    };
  }, [theme]);

  return theme;
}
