import {DependencyList, useCallback, useEffect} from 'react';

import {BackHandler} from 'react-native';

export function useAndroidBackHandler(cb: () => boolean, deps: DependencyList) {
  const handler = useCallback(cb, deps);
  useEffect(() => {
    const {remove} = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => remove();
  }, [handler]);
}
