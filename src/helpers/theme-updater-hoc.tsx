import React, {useMemo} from 'react';

import {useWindowDimensions} from 'react-native';

import {Theme} from '@app/theme';

export function themeUpdaterHOC(Screen: React.ElementType | null) {
  return function HOC(...props: any[]) {
    const dimensions = useWindowDimensions();

    const key = useMemo(
      () => `${Theme.currentTheme}-${dimensions.width}`,
      [dimensions, Theme.currentTheme],
    );

    if (!Screen) {
      return null;
    }

    return <Screen key={key} {...props} />;
  };
}
