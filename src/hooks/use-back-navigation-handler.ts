import {DependencyList, useCallback, useEffect} from 'react';

import {ParamListBase} from '@react-navigation/native';

import {useTypedNavigation} from './use-typed-navigation';

export const useBackNavigationHandler = <T extends ParamListBase>(
  cb: () => void,
  deps: DependencyList,
) => {
  const navigation = useTypedNavigation<T>();

  const listener = useCallback(cb, deps);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', listener);

    return unsubscribe;
  }, [navigation, listener]);
};
