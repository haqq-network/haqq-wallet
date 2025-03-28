import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {observer} from 'mobx-react';

import {WalletConnectApproval} from '@app/components/wallet-connect-approval';
import {WalletSelectType, awaitForWallet} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Wallet, WalletModel} from '@app/models/wallet';
import {
  WalletConnectApprovalStackParamList,
  WalletConnectApprovalStackRoutes,
} from '@app/route-types';
import {WalletConnect} from '@app/services/wallet-connect';

export const WalletConnectApprovalScreen = observer(() => {
  const navigation = useTypedNavigation<WalletConnectApprovalStackParamList>();
  const route = useTypedRoute<
    WalletConnectApprovalStackParamList,
    WalletConnectApprovalStackRoutes.WalletConnectApproval
  >();
  const wallets = Wallet.getAllVisible();
  const [selectedWallet, setSelectedWallet] = useState<WalletModel>(
    wallets?.[0],
  );
  const isApproved = useRef(false);
  const event = useMemo(() => route?.params?.event, [route?.params?.event]);

  const chainId = useMemo(() => {
    const requiredChain =
      event?.params?.requiredNamespaces?.eip155?.chains?.[0];
    const optionalChain =
      event?.params?.optionalNamespaces?.eip155?.chains?.[0];
    const chain = requiredChain || optionalChain;
    if (!chain) {
      return undefined;
    }
    const [, id] = chain.split(':');
    if (!id) {
      return undefined;
    }
    return Number(id);
  }, [event]);

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
      await onPressReject();
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
      chainId,
      eventSuffix: event?.id,
      hideBalance: true,
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
      hideSelectWalletArrow={wallets.length === 1}
      onSelectWalletPress={onSelectWalletPress}
      onPressReject={onPressReject}
      onPressApprove={onPressApprove}
    />
  );
});
