import React, {memo, useCallback, useEffect} from 'react';

import {SessionTypes} from '@walletconnect/types';

import {WalletConnectApplicationList} from '@app/components/wallet-connect-application-list';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useWalletConnectFilteredSessionsByAddress} from '@app/hooks/use-wallet-connect-filtered-sessions-by-address';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {HomeStackRoutes} from '@app/screens/HomeStack';
import {
  WalletConnectStackParamList,
  WalletConnectStackRoutes,
} from '@app/screens/HomeStack/WalletConnectStack';

export const WalletConnectApplicationListScreen = memo(() => {
  const navivation = useTypedNavigation<WalletConnectStackParamList>();
  const {params} = useTypedRoute<
    WalletConnectStackParamList,
    WalletConnectStackRoutes.WalletConnectApplicationList
  >();
  const sessions = useWalletConnectFilteredSessionsByAddress(params.address);

  const handleAppPress = useCallback(
    (session: SessionTypes.Struct) => {
      const nextScreen = params.isPopup
        ? HomeStackRoutes.WalletConnectApplicationDetailsPopup
        : WalletConnectStackRoutes.WalletConnectApplicationDetails;
      navivation.navigate(nextScreen, {session, isPopup: params.isPopup});
    },
    [navivation, params.isPopup],
  );

  useEffect(() => {
    const onFocus = () => {
      if (sessions === undefined) {
        return;
      }

      if (sessions.length === 0) {
        return navivation.goBack();
      }
    };

    return navivation.addListener('focus', onFocus);
  }, [handleAppPress, navivation, sessions]);

  useEffect(() => {
    const title = params?.isPopup
      ? getText(I18N.walletConnectTitle)
      : Wallet.getById(params.address)?.name || params.address;

    navivation.setOptions({
      title,
    });
  }, [params.address, navivation, params?.isPopup]);

  return (
    <WalletConnectApplicationList
      handleAppPress={handleAppPress}
      sessions={sessions!}
    />
  );
});
