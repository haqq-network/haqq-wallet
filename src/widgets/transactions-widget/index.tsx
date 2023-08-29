import React, {memo, useCallback, useMemo} from 'react';

import {useTypedNavigation} from '@app/hooks';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {TransactionsWidget} from '@app/widgets/transactions-widget/transactions-widget';

export const TransactionsWidgetWrapper = memo(() => {
  const navigation = useTypedNavigation();
  const wallets = useMemo(() => Wallet.getAll(), []);

  const openTotalInfo = useCallback(() => {
    navigation.navigate('totalValueInfo');
  }, [navigation]);

  const lastThreeTransactions = useMemo(
    () => Transaction.getAll().snapshot().sorted('createdAt', true).slice(0, 3),
    [],
  );

  const onRowPress = useCallback(
    (hash: string) => {
      navigation.navigate('transactionDetail', {
        hash,
      });
    },
    [navigation],
  );

  return (
    <TransactionsWidget
      onPress={openTotalInfo}
      lastTransactions={lastThreeTransactions}
      onRowPress={onRowPress}
      wallets={wallets}
    />
  );
});
