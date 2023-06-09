import React, {useCallback, useEffect, useState} from 'react';

import {SessionTypes} from '@walletconnect/types';

import {Wallets} from '@app/components/wallets';
import {app} from '@app/contexts';
import {onBannerAction} from '@app/event-actions/on-banner-action';
import {showModal} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useTypedNavigation} from '@app/hooks';
import {useBanners} from '@app/hooks/use-banners';
import {useWalletConnectSessions} from '@app/hooks/use-wallet-connect-sessions';
import {useWalletsVisible} from '@app/hooks/use-wallets-visible';
import {WalletConnect} from '@app/services/wallet-connect';
import {filterWalletConnectSessionsByAddress} from '@app/utils';

export const WalletsWrapper = () => {
  const navigation = useTypedNavigation();

  const visible = useWalletsVisible();

  const {activeSessions} = useWalletConnectSessions();
  const banners = useBanners();
  const [walletConnectSessions, setWalletConnectSessions] = useState<
    SessionTypes.Struct[][]
  >([]);

  const [balance, setBalance] = useState(
    Object.fromEntries(
      visible.map(w => [w.address, app.getBalance(w.address)]),
    ),
  );

  useEffect(() => {
    setWalletConnectSessions(
      visible.map(wallet =>
        filterWalletConnectSessionsByAddress(activeSessions, wallet.address),
      ),
    );
  }, [visible, activeSessions]);

  useEffect(() => {
    const onBalance = () => {
      setBalance(
        Object.fromEntries(
          visible.map(w => [w.address, app.getBalance(w.address)]),
        ),
      );
    };

    app.on('balance', onBalance);
    return () => {
      app.off('balance', onBalance);
    };
  }, [visible]);

  const onPressSend = useCallback(
    (address: string) => {
      navigation.navigate('transaction', {from: address});
    },
    [navigation],
  );

  const onPressQR = useCallback((address: string) => {
    showModal('cardDetailsQr', {address});
  }, []);

  const onPressProtection = useCallback(
    (accountId: string) => {
      if (isFeatureEnabled(Feature.sss)) {
        navigation.navigate('walletProtectionPopup', {accountId});
      } else {
        navigation.navigate('backup', {accountId});
      }
    },
    [navigation],
  );

  const onWalletConnectPress = useCallback(
    (address: string) => {
      const sessionsByAddress = filterWalletConnectSessionsByAddress(
        WalletConnect.instance.getActiveSessions(),
        address,
      );

      if (!sessionsByAddress?.length) {
        return;
      }

      if (sessionsByAddress?.length === 1) {
        return navigation.navigate('walletConnectApplicationDetailsPopup', {
          session: sessionsByAddress[0],
          isPopup: true,
        });
      }

      if (sessionsByAddress?.length > 1) {
        return navigation.navigate('walletConnectApplicationListPopup', {
          address,
        });
      }
    },
    [navigation],
  );

  const onPressCreate = useCallback(() => {
    navigation.navigate('create');
  }, [navigation]);

  const onPressLedger = useCallback(() => {
    navigation.navigate('ledger');
  }, [navigation]);

  const onPressRestore = useCallback(() => {
    navigation.navigate('signin', {next: ''});
  }, [navigation]);

  const onPressBannerAction = useCallback(
    async (id: string, event: string, params: Record<string, any> = {}) => {
      await onBannerAction(id, event, params);
    },
    [],
  );

  const onPressAccountInfo = useCallback(
    (accountId: string) => {
      navigation.navigate('accountInfo', {accountId});
    },
    [navigation],
  );

  return (
    <Wallets
      balance={balance}
      wallets={visible}
      banners={banners}
      walletConnectSessions={walletConnectSessions}
      onWalletConnectPress={onWalletConnectPress}
      onPressSend={onPressSend}
      onPressLedger={onPressLedger}
      onPressCreate={onPressCreate}
      onPressRestore={onPressRestore}
      onPressQR={onPressQR}
      onPressProtection={onPressProtection}
      onPressBanner={onPressBannerAction}
      onPressAccountInfo={onPressAccountInfo}
    />
  );
};
