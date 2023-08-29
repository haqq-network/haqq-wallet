import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {SessionTypes} from '@walletconnect/types';

import {Wallets} from '@app/components/wallets';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useTypedNavigation} from '@app/hooks';
import {useWalletConnectSessions} from '@app/hooks/use-wallet-connect-sessions';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {useWalletsStakingBalance} from '@app/hooks/use-wallets-staking-balance';
import {useWalletsVestingBalance} from '@app/hooks/use-wallets-vesting-balance';
import {useWalletsVisible} from '@app/hooks/use-wallets-visible';
import {HomeStackRoutes} from '@app/screens/HomeStack';
import {HomeFeedStackParamList} from '@app/screens/HomeStack/HomeFeedStack';
import {WalletConnect} from '@app/services/wallet-connect';
import {filterWalletConnectSessionsByAddress} from '@app/utils';

export const WalletsWrapper = () => {
  const navigation = useTypedNavigation<HomeFeedStackParamList>();
  const visible = useWalletsVisible();
  const balance = useWalletsBalance(visible);
  const stakingBalance = useWalletsStakingBalance(visible);
  const vestingBalance = useWalletsVestingBalance(visible);
  const {activeSessions} = useWalletConnectSessions();
  const [walletConnectSessions, setWalletConnectSessions] = useState<
    SessionTypes.Struct[][]
  >([]);
  const showLockedTokens = useMemo(
    () =>
      visible?.length === 1 &&
      isFeatureEnabled(Feature.lockedStakedVestedTokens),
    [visible?.length],
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
      navigation.navigate(HomeStackRoutes.Transaction, {from: address});
    },
    [navigation],
  );

  const onPressQR = useCallback(
    (address: string) => {
      navigation.navigate(HomeStackRoutes.AccountDetail, {address});
    },
    [navigation],
  );

  const onPressProtection = useCallback(
    (accountId: string) => {
      if (isFeatureEnabled(Feature.sss)) {
        navigation.navigate(HomeStackRoutes.WalletProtectionPopup, {accountId});
      } else {
        navigation.navigate(HomeStackRoutes.Backup, {accountId});
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
        return navigation.navigate(
          HomeStackRoutes.WalletConnectApplicationDetailsPopup,
          {
            session: sessionsByAddress[0],
            isPopup: true,
          },
        );
      }

      if (sessionsByAddress?.length > 1) {
        return navigation.navigate(
          HomeStackRoutes.WalletConnectApplicationListPopup,
          {
            address,
          },
        );
      }
    },
    [navigation],
  );

  const onPressCreate = useCallback(() => {
    navigation.navigate(HomeStackRoutes.Create);
  }, [navigation]);

  const onPressLedger = useCallback(() => {
    navigation.navigate(HomeStackRoutes.Ledger);
  }, [navigation]);

  const onPressRestore = useCallback(() => {
    navigation.navigate(HomeStackRoutes.SignIn);
  }, [navigation]);

  const onPressAccountInfo = useCallback(
    (accountId: string) => {
      navigation.navigate(HomeStackRoutes.AccountInfo, {accountId});
    },
    [navigation],
  );

  return (
    <Wallets
      balance={balance}
      wallets={visible}
      walletConnectSessions={walletConnectSessions}
      showLockedTokens={showLockedTokens}
      stakingBalance={stakingBalance}
      vestingBalance={vestingBalance}
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
};
