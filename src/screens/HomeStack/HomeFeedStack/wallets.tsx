import React, {useCallback} from 'react';

import {
  ProviderMnemonicBase,
  ProviderSSSBase,
  ProviderSSSEvm,
} from '@haqq/rn-wallet-providers';
import {observer} from 'mobx-react';

import {Wallets} from '@app/components/wallets';
import {getProviderForNewWallet} from '@app/helpers/get-provider-for-new-wallet';
import {useTypedNavigation} from '@app/hooks';
import {Wallet, WalletModel} from '@app/models/wallet';
import {HomeFeedStackParamList, HomeStackRoutes} from '@app/route-types';
import {WalletConnect} from '@app/services/wallet-connect';
import {WalletType} from '@app/types';
import {filterWalletConnectSessionsByAddress} from '@app/utils';

export const WalletsWrapper = observer(() => {
  const navigation = useTypedNavigation<HomeFeedStackParamList>();
  const visible = Wallet.getAllVisible();
  const balance = Wallet.getBalancesByAddressList(visible);

  const onPressSend = useCallback(
    (address: string) => {
      navigation.navigate(HomeStackRoutes.Transaction, {from: address});
    },
    [navigation],
  );

  const onPressReceive = useCallback(
    (address: string) => {
      navigation.navigate(HomeStackRoutes.SelectNetwork, {address});
    },
    [navigation],
  );

  const onPressPhrase = useCallback(
    (wallet: WalletModel) => {
      navigation.navigate(HomeStackRoutes.Backup, {
        wallet,
        pinEnabled: true,
      });
    },
    [navigation],
  );

  const onPressSocial = useCallback(
    (accountId: string) => {
      navigation.navigate(HomeStackRoutes.SssMigrate, {
        accountId,
        pinEnabled: true,
      });
    },
    [navigation],
  );

  const onPressProtection = useCallback(
    async (wallet: WalletModel) => {
      if (!wallet.accountId) {
        return;
      }
      const {accountId} = wallet;
      const isNoBackup = !wallet.mnemonicSaved && !wallet.socialLinkEnabled;

      const userHaveSSSProtectedWallets = !!Wallet.getAll().find(
        w => w.type === WalletType.sss && w.socialLinkEnabled,
      )?.accountId;

      if (isNoBackup && !userHaveSSSProtectedWallets) {
        navigation.navigate(HomeStackRoutes.WalletProtectionPopup, {
          wallet,
          pinEnabled: true,
        });
        return;
      }

      if (!wallet.mnemonicSaved) {
        onPressPhrase(wallet);
      }
      if (!wallet.socialLinkEnabled && !userHaveSSSProtectedWallets) {
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
    const getType = (provider: ProviderMnemonicBase | ProviderSSSBase) => {
      if (
        provider instanceof ProviderSSSBase ||
        provider instanceof ProviderSSSEvm
      ) {
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

  const onPressHardwareWallet = useCallback(() => {
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
      onPressHardwareWallet={onPressHardwareWallet}
      onPressCreate={onPressCreate}
      onPressRestore={onPressRestore}
      onPressReceive={onPressReceive}
      onPressProtection={onPressProtection}
      onPressAccountInfo={onPressAccountInfo}
      testID="wallets"
    />
  );
});
