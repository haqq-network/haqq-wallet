import React from 'react';

import {useTheme} from '@app/hooks';

export function themeUpdaterHOC(Screen: React.ElementType) {
  return function HOC(...props: any[]) {
    const theme = useTheme();
    return <Screen key={theme} {...props} />;
  };
}
