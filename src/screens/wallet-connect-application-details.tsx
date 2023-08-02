import React, {useCallback, useEffect, useMemo} from 'react';

import {WalletConnectApplicationDetails} from '@app/components/wallet-connect-application-details';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {WalletConnectSessionMetadata} from '@app/models/wallet-connect-session-metadata';
import {WalletConnect} from '@app/services/wallet-connect';
import {getWalletConnectAccountsFromSession} from '@app/utils';

export const WalletConnectApplicationDetailsScreen = () => {
  const navivation = useTypedNavigation();
  const {params} = useTypedRoute<'walletConnectApplicationDetails'>();
  const session = useMemo(() => params?.session, [params?.session]);

  const account = useMemo(
    () => getWalletConnectAccountsFromSession(session)[0],
    [session],
  );

  const linkedWallet = useMemo(
    () => Wallet.getById(account.address),
    [account.address],
  );

  const sessionMetadata = useMemo(
    () => WalletConnectSessionMetadata.getById(session.topic),
    [session.topic],
  );

  useEffect(() => {
    const title = params?.isPopup
      ? getText(I18N.walletConnectTitle)
      : Wallet.getById(account.address)?.name || account.address;

    navivation.setOptions({
      title,
    });
  }, [navivation, params?.isPopup, account.address]);

  const handleDisconnectPress = useCallback(async () => {
    try {
      await WalletConnect.instance.disconnectSession(session.topic);
      navivation.goBack();
    } catch (err) {
      Logger.error(
        'WalletConnectApplicationDetailsScreen:handleDisconnectPress',
        err,
      );
    }
  }, [navivation, session.topic]);

  return (
    <WalletConnectApplicationDetails
      session={session}
      linkedWallet={linkedWallet!}
      sessionMetadata={sessionMetadata!}
      handleDisconnectPress={handleDisconnectPress}
    />
  );
};
