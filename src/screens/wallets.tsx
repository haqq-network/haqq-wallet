import React, {useCallback} from 'react';

import {observer} from 'mobx-react';

import {Wallets} from '@app/components/wallets';
import {app} from '@app/contexts';
import {useTypedNavigation} from '@app/hooks';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {Wallet} from '@app/models/wallet';
import {WalletConnect} from '@app/services/wallet-connect';
import {filterWalletConnectSessionsByAddress} from '@app/utils';

export const WalletsWrapper = observer(() => {
  const navigation = useTypedNavigation();
  const visible = Wallet.getAllVisible();
  const balance = useWalletsBalance(visible);

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

  const onPressPharse = useCallback(
    (accountId: string) => {
      navigation.navigate('backup', {accountId});
    },
    [navigation],
  );

  const onPressSocial = useCallback(
    (accountId: string) => {
      navigation.navigate('sssMigrate', {accountId});
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
        navigation.navigate('walletProtectionPopup', {accountId});
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
