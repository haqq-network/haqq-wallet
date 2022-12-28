import {useContext} from 'react';

import {ThemeContext} from '@app/contexts/theme';

export const useTheme = () => {
  const theme = useContext(ThemeContext);

  return theme;
};
