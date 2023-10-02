import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {SessionTypes} from '@walletconnect/types';
import {observer} from 'mobx-react';

import {Wallets} from '@app/components/wallets';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useTypedNavigation, useWalletsVisible} from '@app/hooks';
import {useWalletConnectSessions} from '@app/hooks/use-wallet-connect-sessions';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {WalletConnect} from '@app/services/wallet-connect';
import {filterWalletConnectSessionsByAddress} from '@app/utils';

export const WalletsWrapper = observer(() => {
  const navigation = useTypedNavigation();
  const visible = useWalletsVisible();
  const balance = useWalletsBalance(visible);
  const {activeSessions} = useWalletConnectSessions();
  const [walletConnectSessions, setWalletConnectSessions] = useState<
    SessionTypes.Struct[][]
  >([]);
  const showLockedTokens = useMemo(
    () => isFeatureEnabled(Feature.lockedStakedVestedTokens),
    [],
  );

  useEffect(() => {
    setWalletConnectSessions(
      visible.map(wallet =>
        filterWalletConnectSessionsByAddress(activeSessions, wallet.address),
      ),
    );
  }, [visible, activeSessions]);

  const onPressSend = useCallback(
    (address: string) => {
      navigation.navigate('transaction', {from: address});
    },
    [navigation],
  );

  const onPressQR = useCallback(
    (address: string) => {
      navigation.navigate('accountDetail', {address});
    },
    [navigation],
  );

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

  const onPressWalletConnect = useCallback(
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
      walletConnectSessions={walletConnectSessions}
      showLockedTokens={showLockedTokens}
      onPressWalletConnect={onPressWalletConnect}
      onPressSend={onPressSend}
      onPressLedger={onPressLedger}
      onPressCreate={onPressCreate}
      onPressRestore={onPressRestore}
      onPressQR={onPressQR}
      onPressProtection={onPressProtection}
      onPressAccountInfo={onPressAccountInfo}
      testID="wallets"
    />
  );
});
