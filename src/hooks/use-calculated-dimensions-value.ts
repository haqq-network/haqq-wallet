import {DependencyList, useCallback, useMemo} from 'react';

import {ScaledSize, useWindowDimensions} from 'react-native';

type CalculatedDimensionsValueFn<T> = (dimensions: ScaledSize) => T;

export const useCalculatedDimensionsValue = <T>(
  fn: CalculatedDimensionsValueFn<T>,
  deps: DependencyList = [],
): T => {
  const dimensions = useWindowDimensions();
  const memoizedFn = useCallback(fn, [fn, ...deps]);
  return useMemo(() => memoizedFn(dimensions), [dimensions, memoizedFn]);
};
