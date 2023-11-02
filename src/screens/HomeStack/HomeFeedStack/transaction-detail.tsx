import React, {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';

import {TransactionDetail} from '@app/components/transaction-detail';
import {openURL} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useTransaction} from '@app/hooks/use-transaction';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';
import {EthNetwork} from '@app/services';
import {TransactionSource} from '@app/types';

export const TransactionDetailScreen = observer(() => {
  const navigation = useTypedNavigation<HomeStackParamList>();
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.TransactionDetail
  >();

  const transaction = useTransaction(route.params.hash);

  const source = useMemo(() => {
    const visibleAddressList = Wallet.getAllVisible().map(w => w.address);

    if (transaction?.input.includes('0x') && transaction.input.length > 2) {
      return TransactionSource.contract;
    }

    return visibleAddressList.includes(transaction?.from.toLowerCase() ?? '')
      ? TransactionSource.send
      : TransactionSource.receive;
  }, [transaction]);

  const provider = useMemo(
    () => (transaction ? Provider.getById(transaction.providerId) : null),
    [transaction],
  );

  const onPressInfo = useCallback(async () => {
    try {
      const url = `${EthNetwork.explorer}tx/${transaction?.hash}`;
      await openURL(url);
    } catch (_e) {}
  }, [transaction?.hash]);

  if (!transaction) {
    return null;
  }

  const onCloseBottomSheet = () => {
    navigation.canGoBack() && navigation.goBack();
  };

  return (
    <TransactionDetail
      source={source}
      provider={provider}
      transaction={transaction}
      onCloseBottomSheet={onCloseBottomSheet}
      onPressInfo={onPressInfo}
      contractName={route.params?.contractName}
    />
  );
});
