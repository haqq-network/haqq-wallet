import React, {useMemo} from 'react';

import {useWindowDimensions} from 'react-native';

import {useTheme} from '@app/hooks';

export function themeUpdaterHOC(Screen: React.ElementType | null) {
  return function HOC(...props: any[]) {
    const theme = useTheme();
    const dimensions = useWindowDimensions();

    const key = useMemo(
      () => `${theme}-${dimensions.width}`,
      [dimensions, theme],
    );

    if (!Screen) {
      return null;
    }

    return <Screen key={key} {...props} />;
  };
}
