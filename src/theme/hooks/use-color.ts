import React from 'react';

import {Color, Theme, getColor} from '@app/theme';

export function useColor(color: Color) {
  return React.useMemo(() => getColor(color), [color, Theme.currentTheme]);
}
