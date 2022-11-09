import {useEffect, useState} from 'react';

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

    app.on('theme', subscription);

    return () => {
      app.off('theme', subscription);
    };
  }, [theme]);

  return theme;
}
