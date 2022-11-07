import {useEffect, useState} from 'react';

import {app} from '../contexts/app';

export function useTheme() {
  const [theme, setTheme] = useState(app.getTheme());

  useEffect(() => {
    const subscription = () => {
      if (theme !== app.getTheme()) {
        setTheme(app.getTheme());
      }
    };

    app.on('theme', subscription);

    return () => {
      app.off('theme', subscription);
    };
  }, [theme]);

  return theme;
}
