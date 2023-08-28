import React, {useCallback, useEffect} from 'react';

import {SessionTypes} from '@walletconnect/types';

import {WalletConnectApplicationList} from '@app/components/wallet-connect-application-list';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useWalletConnectFilteredSessionsByAddress} from '@app/hooks/use-wallet-connect-filtered-sessions-by-address';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';

export const WalletConnectApplicationListScreen = () => {
  const navivation = useTypedNavigation();
  const {params} = useTypedRoute<'walletConnectApplicationList'>();
  const sessions = useWalletConnectFilteredSessionsByAddress(params?.address);

  const handleAppPress = useCallback(
    (session: SessionTypes.Struct) => {
      const nextScreen = params.isPopup
        ? 'walletConnectApplicationDetailsPopup'
        : 'walletConnectApplicationDetails';
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
      : Wallet.getById(params?.address)?.name || params?.address;

    navivation.setOptions({
      title,
    });
  }, [params?.address, navivation, params?.isPopup]);

  return (
    <WalletConnectApplicationList
      handleAppPress={handleAppPress}
      sessions={sessions!}
    />
  );
};
