import {useCallback, useState} from 'react';

import {LayoutChangeEvent, LayoutRectangle} from 'react-native';

export type Layout = LayoutRectangle;

const DEFAULT_LAYOUT: Layout = {
  height: 0,
  width: 0,
  x: 0,
  y: 0,
};

export const useLayout = (onLayoutChange?: (layout: Layout) => void) => {
  const [layout, setLayout] = useState<Layout>(DEFAULT_LAYOUT);

  const onLayoutHandler = useCallback(
    (event: LayoutChangeEvent) => {
      const nextLayout = event?.nativeEvent?.layout || DEFAULT_LAYOUT;
      setLayout(nextLayout);
      onLayoutChange?.(nextLayout);
    },
    [onLayoutChange],
  );

  return [layout, onLayoutHandler] as [Layout, typeof onLayoutHandler];
};
