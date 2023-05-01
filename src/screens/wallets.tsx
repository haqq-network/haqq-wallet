import React, {useCallback, useEffect, useState} from 'react';

import {SessionTypes} from '@walletconnect/types';

import {Color} from '@app/colors';
import {Wallets} from '@app/components/wallets';
import {app} from '@app/contexts';
import {onBannerClaimAirdrop} from '@app/event-actions/on-banner-claim-airdrop';
import {onBannerNotificationsSnooze} from '@app/event-actions/on-banner-notifications-snooze';
import {onBannerNotificationsTopicSnooze} from '@app/event-actions/on-banner-notifications-topic-snooze';
import {onBannerNotificationsTopicSubscribe} from '@app/event-actions/on-banner-notifications-topic-subscribe';
import {onBannerNotificationsTurnOn} from '@app/event-actions/on-banner-notifications-turn-on';
import {onBannerSnoozeUntil} from '@app/event-actions/on-banner-snooze-until';
import {showModal} from '@app/helpers';
import {useTypedNavigation, useWallets} from '@app/hooks';
import {useBanners} from '@app/hooks/use-banners';
import {useWalletConnectSessions} from '@app/hooks/use-wallet-connect-sessions';
import {I18N, getText} from '@app/i18n';
import {WalletConnect} from '@app/services/wallet-connect';
import {filterWalletConnectSessionsByAddress} from '@app/utils';

export const WalletsWrapper = () => {
  const navigation = useTypedNavigation();
  const wallets = useWallets();
  const [visibleRows, setVisibleRows] = useState(wallets.visible);
  const {activeSessions} = useWalletConnectSessions();
  const banners = useBanners();
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

  const onPressClaimReward = useCallback(
    async (id: string, event: string, params: Record<string, any> = {}) => {
      try {
        switch (event) {
          case 'claimCode':
            await onBannerClaimAirdrop(id);
            break;
          case 'close':
            await onBannerSnoozeUntil(id);
            break;
          case 'notificationsTurnOn':
            await onBannerNotificationsTurnOn(id);
            break;
          case 'notificationsSnooze':
            await onBannerNotificationsSnooze(id);
            break;
          case 'notificationsTopicSubscribe':
            await onBannerNotificationsTopicSubscribe(id, params.topic ?? '');
            break;
          case 'notificationsTopicSnooze':
            await onBannerNotificationsTopicSnooze(id, params.topic ?? '');
            break;
        }
      } catch (e) {
        if (e instanceof Error) {
          showModal('error', {
            title: getText(I18N.modalRewardErrorTitle),
            description: e.message,
            close: getText(I18N.modalRewardErrorClose),
            icon: 'reward_error',
            color: Color.graphicSecond4,
          });
        }
      }
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
      wallets={visibleRows}
      banners={banners}
      walletConnectSessions={walletConnectSessions}
      onWalletConnectPress={onWalletConnectPress}
      onPressSend={onPressSend}
      onPressLedger={onPressLedger}
      onPressCreate={onPressCreate}
      onPressRestore={onPressRestore}
      onPressQR={onPressQR}
      onPressProtection={onPressProtection}
      onPressBanner={onPressClaimReward}
      onPressAccountInfo={onPressAccountInfo}
    />
  );
};
