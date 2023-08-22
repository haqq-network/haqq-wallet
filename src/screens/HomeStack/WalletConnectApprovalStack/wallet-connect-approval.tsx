import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {WalletConnectApproval} from '@app/components/wallet-connect-approval';
import {WalletSelectType, awaitForWallet} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useWalletsVisible} from '@app/hooks/use-wallets-visible';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {
  WalletConnectApprovalStackParamList,
  WalletConnectApprovalStackRoutes,
} from '@app/screens/HomeStack/WalletConnectApprovalStack';
import {WalletConnect} from '@app/services/wallet-connect';

export const WalletConnectApprovalScreen = memo(() => {
  const navigation = useTypedNavigation<WalletConnectApprovalStackParamList>();
  const route = useTypedRoute<
    WalletConnectApprovalStackParamList,
    WalletConnectApprovalStackRoutes.WalletConnectApproval
  >();
  const wallets = useWalletsVisible();
  const [selectedWallet, setSelectedWallet] = useState<Wallet>(wallets?.[0]);
  const isApproved = useRef(false);
  const event = useMemo(() => route?.params?.event, [route?.params?.event]);

  const rejectSession = useCallback(
    () =>
      !isApproved.current && WalletConnect.instance.rejectSession(event?.id),
    [event?.id],
  );

  const onPressApprove = useCallback(async () => {
    try {
      await WalletConnect.instance.approveSession(
        event?.id,
        selectedWallet?.address,
        event?.params,
      );
      isApproved.current = true;
    } catch (err) {
      Logger.captureException(
        err,
        'WalletConnectApprovalScreen:onPressApprove',
        {
          event,
        },
      );
    }
    navigation.goBack();
  }, [event, navigation, selectedWallet?.address]);

  const onPressReject = useCallback(async () => {
    try {
      await rejectSession();
    } catch (err) {
      Logger.captureException(
        err,
        'WalletConnectApprovalScreen:onPressReject',
        {
          event,
        },
      );
    }
    navigation.goBack();
  }, [event, navigation, rejectSession]);

  const onSelectWalletPress = async () => {
    const address = await awaitForWallet({
      wallets: wallets,
      title: I18N.selectAccount,
      type: WalletSelectType.screen,
      initialAddress: selectedWallet?.address,
    });
    setSelectedWallet(Wallet.getById(address)!);
  };

  useEffect(() => {
    const onBeforeRemove = () => {
      rejectSession();
    };

    navigation.addListener('beforeRemove', onBeforeRemove);
    return () => navigation.removeListener('beforeRemove', onBeforeRemove);
  }, [navigation, rejectSession]);

  return (
    <WalletConnectApproval
      event={event}
      selectedWallet={selectedWallet}
      onSelectWalletPress={onSelectWalletPress}
      onPressReject={onPressReject}
      onPressApprove={onPressApprove}
    />
  );
});
