import React, {useCallback, useEffect, useState} from 'react';

import {SessionTypes} from '@walletconnect/types';
import {Alert} from 'react-native';

import {Color} from '@app/colors';
import {Wallets} from '@app/components/wallets';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {awaitForCaptcha} from '@app/helpers/await-for-captcha';
import {useTypedNavigation, useWallets} from '@app/hooks';
import {useActiveRefferal} from '@app/hooks/use-active-refferal';
import {useWalletConnectSessions} from '@app/hooks/use-wallet-connect-sessions';
import {I18N, getText} from '@app/i18n';
import {Refferal} from '@app/models/refferal';
import {WalletConnect} from '@app/services/wallet-connect';
import {filterWalletConnectSessionsByAddress} from '@app/utils';

export const WalletsWrapper = () => {
  const navigation = useTypedNavigation();
  const wallets = useWallets();
  const [visibleRows, setVisibleRows] = useState(wallets.visible);
  const {activeSessions} = useWalletConnectSessions();
  const activeRefferal = useActiveRefferal();
  const [walletConnectSessions, setWalletConnectSessions] = useState<
    SessionTypes.Struct[][]
  >([]);

  const [balance, setBalance] = useState(
    Object.fromEntries(
      visibleRows.map(w => [w.address, app.getBalance(w.address)]),
    ),
  );

  useEffect(() => {
    setWalletConnectSessions(
      visibleRows.map(wallet =>
        filterWalletConnectSessionsByAddress(activeSessions, wallet.address),
      ),
    );
  }, [visibleRows, activeSessions]);

  useEffect(() => {
    const onBalance = () => {
      setBalance(
        Object.fromEntries(
          visibleRows.map(w => [w.address, app.getBalance(w.address)]),
        ),
      );
    };

    app.on('balance', onBalance);
    return () => {
      app.off('balance', onBalance);
    };
  }, [visibleRows]);

  const updateWallets = useCallback(() => {
    setVisibleRows(wallets.visible);
  }, [wallets]);

  useEffect(() => {
    wallets.on('wallets', updateWallets);

    return () => {
      wallets.off('wallets', updateWallets);
    };
  }, [updateWallets, wallets]);

  const onPressSend = useCallback(
    (address: string) => {
      navigation.navigate('transaction', {from: address});
    },
    [navigation],
  );

  const onPressQR = useCallback((address: string) => {
    showModal('card-details-qr', {address: address});
  }, []);

  const onPressProtection = useCallback(
    (accountId: string) => {
      navigation.navigate('walletProtectionPopup', {accountId});
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

  const onPressClaimReward = useCallback(async (refferal: Refferal) => {
    try {
      const captchaKey = await awaitForCaptcha();
      const data = {
        ...refferal.toJSON(),
        captchaKey,
      };
      // TODO: request to backend
      Alert.alert('Result', JSON.stringify(data, null, 2));
      refferal.update({
        isUsed: true,
      });
    } catch (err) {
      showModal('error', {
        title: getText(I18N.modalRewardErrorTitle),
        description: getText(I18N.modalRewardErrorDescription),
        close: getText(I18N.modalRewardErrorClose),
        icon: 'reward_error',
        color: Color.graphicSecond4,
      });
    }
  }, []);

  const onPressAccountInfo = useCallback(
    (accountId: string) => {
      navigation.navigate('accountInfo', {accountId});
    },
    [navigation],
  );

  return (
    <Wallets
      balance={balance}
      wallets={visibleRows}
      refferal={activeRefferal}
      walletConnectSessions={walletConnectSessions}
      onWalletConnectPress={onWalletConnectPress}
      onPressSend={onPressSend}
      onPressLedger={onPressLedger}
      onPressCreate={onPressCreate}
      onPressRestore={onPressRestore}
      onPressQR={onPressQR}
      onPressProtection={onPressProtection}
      onPressClaimReward={onPressClaimReward}
      onPressAccountInfo={onPressAccountInfo}
    />
  );
};
