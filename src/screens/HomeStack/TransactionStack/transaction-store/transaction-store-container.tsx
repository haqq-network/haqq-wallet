import {PropsWithChildren, useCallback} from 'react';

import {useFocusEffect} from '@react-navigation/native';

import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';

import {TransactionStore} from './transaction.store';

type TransactionStoreContainerProps = {
  initialParams: HomeStackParamList[HomeStackRoutes.Transaction];
};

export const TransactionStoreContainer = ({
  initialParams: {from, to, token},
  children,
}: PropsWithChildren<TransactionStoreContainerProps>) => {
  useFocusEffect(
    useCallback(() => {
      TransactionStore.init(from, to, token);

      return () => {
        TransactionStore.clear();
      };
    }, []),
  );

  return children;
};
