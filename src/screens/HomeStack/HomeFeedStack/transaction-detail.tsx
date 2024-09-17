import React, {useCallback, useEffect, useMemo} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {format} from 'date-fns';
import {observer} from 'mobx-react';

import {TransactionDetail} from '@app/components/transaction-detail';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {shortAddress} from '@app/helpers/short-address';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useTransaction} from '@app/hooks/use-transaction';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';
import {sendNotification} from '@app/services';
import {Balance} from '@app/services/balance';
import {openInAppBrowser, splitAddress} from '@app/utils';

export const TransactionDetailScreen = observer(() => {
  const navigation = useTypedNavigation<HomeStackParamList>();
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.TransactionDetail
  >();
  const tx = useTransaction(route.params.txId);
  const provider = useMemo(
    () => Provider.getByEthChainId(tx.chain_id),
    [tx.chain_id],
  );

  const timestamp = useMemo(
    () => format(new Date(tx.ts), 'dd MMMM yyyy, HH:mm'),
    [tx.ts],
  );

  const splitted = useMemo(
    () => splitAddress(tx.parsed.isOutcoming ? tx.parsed.to : tx.parsed.from),
    [tx],
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

  const onPressAddress = useCallback(() => {
    Clipboard.setString(tx.parsed.isOutcoming ? tx.parsed.to : tx.parsed.from);
    sendNotification(I18N.notificationCopied);
  }, [tx]);

  const onCloseBottomSheet = useCallback(() => {
    navigation.canGoBack() && navigation.goBack();
  }, [navigation]);

  const onPressSpenderAddress = useCallback((address: string) => {
    const url = provider!.getAddressExplorerUrl(address);
    return openInAppBrowser(url);
  }, []);

  useEffect(() => {
    if (app.isTesterMode || app.isDeveloper) {
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
      splitted={splitted}
      fee={fee}
      total={total}
      onPressAddress={onPressAddress}
      onCloseBottomSheet={onCloseBottomSheet}
      onPressInfo={onPressInfo}
      onPressSpenderAddress={onPressSpenderAddress}
    />
  );
});
