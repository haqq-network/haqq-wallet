import {useEffect} from 'react';

import {ParamListBase} from '@react-navigation/native';

import {useTypedNavigation} from './use-typed-navigation';

export const useBackNavigationHandler = <T extends ParamListBase>(
  cb: () => void,
) => {
  const navigation = useTypedNavigation<T>();

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', cb);

    return unsubscribe;
  }, [navigation]);
};
