import React, {useCallback, useEffect, useMemo} from 'react';

import {format} from 'date-fns';
import {observer} from 'mobx-react';

import {TransactionDetail} from '@app/components/transaction-detail';
import {Loading} from '@app/components/ui';
import {shortAddress} from '@app/helpers/short-address';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useTransaction} from '@app/hooks/use-transaction';
import {AppStore} from '@app/models/app';
import {Provider} from '@app/models/provider';
import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {openInAppBrowser} from '@app/utils';

export const TransactionDetailScreen = observer(() => {
  const navigation = useTypedNavigation<HomeStackParamList>();
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.TransactionDetail
  >();
  const tx = useTransaction(route.params.txId, route.params.txType);
  const provider = useMemo(
    () => Provider.getByEthChainId(tx.chain_id),
    [tx.chain_id],
  );

  const timestamp = useMemo(
    () => format(new Date(tx.ts), 'dd MMMM yyyy, HH:mm'),
    [tx.ts],
  );

  const fee = useMemo(
    () => new Balance(`${tx.fee}`, provider?.decimals, provider?.denom),
    [tx.fee],
  );

  // TODO: fix calculation of total amount
  // const total = useMemo(() => fee.operate(amount, 'add'), [fee, amount]);
  const total = useMemo(() => Balance.Empty, []);

  const onPressInfo = useCallback(async () => {
    const url = provider?.getTxExplorerUrl(tx?.hash);
    if (url) {
      openInAppBrowser(url);
    }
  }, [tx]);

  const onCloseBottomSheet = useCallback(() => {
    navigation.canGoBack() && navigation.goBack();
  }, [navigation]);

  const onPressSpenderAddress = useCallback((address: string) => {
    const url = provider!.getAddressExplorerUrl(address);
    return openInAppBrowser(url);
  }, []);

  useEffect(() => {
    if (AppStore.isAdditionalFeaturesEnabled) {
      Logger.log(
        '===================== [ TRANSACTION DETAILS ] =====================',
      );
      Logger.log(
        '🟢 tx',
        shortAddress(tx.hash, '*'),
        JSON.stringify(tx, null, 2),
      );
    }
  }, [tx]);

  if (!tx) {
    return <Loading />;
  }

  return (
    <TransactionDetail
      tx={tx}
      timestamp={timestamp}
      fee={fee}
      total={total}
      onCloseBottomSheet={onCloseBottomSheet}
      onPressInfo={onPressInfo}
      onPressSpenderAddress={onPressSpenderAddress}
    />
  );
});
