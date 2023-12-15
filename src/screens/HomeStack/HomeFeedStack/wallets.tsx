import React, {useCallback} from 'react';

import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';
import {observer} from 'mobx-react';

import {Wallets} from '@app/components/wallets';
import {app} from '@app/contexts';
import {getProviderForNewWallet} from '@app/helpers/get-provider-for-new-wallet';
import {useTypedNavigation} from '@app/hooks';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {Wallet} from '@app/models/wallet';
import {HomeStackRoutes} from '@app/screens/HomeStack';
import {HomeFeedStackParamList} from '@app/screens/HomeStack/HomeFeedStack';
import {WalletConnect} from '@app/services/wallet-connect';
import {WalletType} from '@app/types';
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

  const onPressPhrase = useCallback(
    (wallet: Wallet) => {
      navigation.navigate(HomeStackRoutes.Backup, {wallet});
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

      const userHaveSSSProtectedWallets = !!Wallet.getAll().find(
        w => w.type === WalletType.sss && w.socialLinkEnabled,
      )?.accountId;

      if (isNoBackup && !userHaveSSSProtectedWallets) {
        await app.auth();
        navigation.navigate(HomeStackRoutes.WalletProtectionPopup, {wallet});
        return;
      }

      if (!wallet.mnemonicSaved) {
        await app.auth();
        onPressPhrase(wallet);
      }
      if (!wallet.socialLinkEnabled && !userHaveSSSProtectedWallets) {
        await app.auth();
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
    const getType = (
      provider: ProviderMnemonicReactNative | ProviderSSSReactNative,
    ) => {
      if (provider instanceof ProviderSSSReactNative) {
        return WalletType.sss;
      }
      return WalletType.mnemonic;
    };

    const provider = await getProviderForNewWallet();
    if (!provider) {
      return;
    }
    const type = getType(provider);

    //@ts-ignore
    navigation.navigate(HomeStackRoutes.Create, {
      type,
      provider,
    });
  }, [navigation]);

  const onPressLedger = useCallback(() => {
    navigation.navigate(HomeStackRoutes.Device);
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
