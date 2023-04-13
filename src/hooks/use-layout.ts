import {useCallback, useState} from 'react';

import {LayoutChangeEvent, LayoutRectangle} from 'react-native';

export type Layout = Partial<LayoutRectangle>;
export const useLayout = (onLayoutChange?: (layout: Layout) => void) => {
  const [layout, setLayout] = useState<Layout>({
    height: 0,
    width: 0,
    x: 0,
    y: 0,
  });

  const onLayoutHandler = useCallback(
    (event: LayoutChangeEvent) => {
      setLayout(event?.nativeEvent?.layout);
      onLayoutChange?.(event?.nativeEvent?.layout);
    },
    [onLayoutChange],
  );

  return [layout, onLayoutHandler] as [Layout, typeof onLayoutHandler];
};
