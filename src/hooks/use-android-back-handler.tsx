import {DependencyList, useCallback, useEffect} from 'react';

import {BackHandler} from 'react-native';

export function useAndroidBackHandler(cb: () => boolean, deps: DependencyList) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handler = useCallback(cb, deps);
  useEffect(() => {
    const {remove} = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => remove();
  }, [handler]);
}
