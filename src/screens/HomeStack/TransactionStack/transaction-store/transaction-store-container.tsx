import {PropsWithChildren, useCallback} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {observer} from 'mobx-react';

import {KeyboardSafeArea} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';

import {TransactionStore} from './transaction.store';

type TransactionStoreContainerProps = {
  initialParams: HomeStackParamList[HomeStackRoutes.Transaction];
};

export const TransactionStoreContainer = observer(
  ({
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

    if (!TransactionStore.wallet) {
      return null;
    }

    return (
      <KeyboardSafeArea style={styles.keyboardAvoidingView}>
        {children}
      </KeyboardSafeArea>
    );
  },
);

const styles = createTheme({
  keyboardAvoidingView: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
