import React, {useCallback} from 'react';

import {ProviderLedgerReactNative} from '@haqq/provider-ledger-react-native';
import {observer} from 'mobx-react';

import {Wallets} from '@app/components/wallets';
import {app} from '@app/contexts';
import {getProviderInstanceForWallet} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {Wallet} from '@app/models/wallet';
import {HomeStackRoutes} from '@app/screens/HomeStack';
import {HomeFeedStackParamList} from '@app/screens/HomeStack/HomeFeedStack';
import {WalletConnect} from '@app/services/wallet-connect';
import {filterWalletConnectSessionsByAddress} from '@app/utils';

export const WalletsWrapper = observer(() => {
  const navigation = useTypedNavigation<HomeFeedStackParamList>();
  const visible = Wallet.getAllVisible();
  const balance = useWalletsBalance(visible);

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

  const onPressPharse = useCallback(
    (accountId: string) => {
      navigation.navigate(HomeStackRoutes.Backup, {accountId});
    },
    [navigation],
  );

  const onPressSocial = useCallback(
    (accountId: string) => {
      navigation.navigate(HomeStackRoutes.SssMigrate, {accountId});
    },
    [navigation],
  );

  const onPressProtection = useCallback(
    async (wallet: Wallet) => {
      if (!wallet.accountId) {
        return;
      }
      const {accountId} = wallet;
      const isNoBackup = !wallet.mnemonicSaved && !wallet.socialLinkEnabled;

      await app.auth();

      if (isNoBackup) {
        navigation.navigate(HomeStackRoutes.WalletProtectionPopup, {accountId});
        return;
      }

      if (!wallet.mnemonicSaved) {
        onPressPharse(accountId);
      }
      if (!wallet.socialLinkEnabled) {
        onPressSocial(accountId);
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

  const onPressCreate = useCallback(async () => {
    const rootWalletProvider = await getProviderInstanceForWallet(
      visible[0],
      false,
      true,
    );

    if (rootWalletProvider instanceof ProviderLedgerReactNative) {
      onPressLedger();
      return;
    }

    if (rootWalletProvider) {
      //@ts-ignore
      navigation.navigate(HomeStackRoutes.Create, {
        type: visible[0].type,
        provider: rootWalletProvider,
      });
    }
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
      showLockedTokens
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
