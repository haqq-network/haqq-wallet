import React from 'react';

import {Color, getColor} from '@app/colors';

import {useTheme} from './use-theme';

export function useColor(color: Color) {
  const theme = useTheme();

  return React.useMemo(() => getColor(color), [color, theme]);
}
