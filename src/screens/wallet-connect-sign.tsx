import React, {useCallback, useMemo} from 'react';

import {WalletConnectSign} from '@app/components/wallet-connect-sign';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useWalletConnectSession} from '@app/hooks/use-wallet-connect-session';
import {Wallet} from '@app/models/wallet';
import {WalletConnect} from '@app/services/wallet-connect';
import {getUserAddressFromSessionRequest} from '@app/utils';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

export const WalletConnectSignScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'walletConnectSign'>();
  const event = useMemo(() => route?.params?.event, [route?.params?.event]);
  const request = useMemo(() => event.params.request, [event]);
  const session = useWalletConnectSession(event?.topic);

  const isTransaction = useMemo(
    () =>
      request.method === EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION ||
      request.method === EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
    [request],
  );

  const wallet = useMemo(
    () => Wallet.getById(getUserAddressFromSessionRequest(event)),
    [event],
  );

  const onPressSign = useCallback(async () => {
    try {
      await WalletConnect.instance.approveEIP155Request(wallet!, event);
      navigation.goBack();
    } catch (err) {
      console.log('🔴 onPressApprove', err);
    }
  }, [event, navigation, wallet]);

  const onPressReject = useCallback(async () => {
    try {
      await WalletConnect.instance.rejectSessionRequest(event.id, event.topic);
      navigation.goBack();
    } catch (err) {
      console.log('🔴 onPressReject', err);
    }
  }, [event, navigation]);

  return (
    <WalletConnectSign
      isTransaction={isTransaction}
      event={event}
      session={session!}
      wallet={wallet!}
      onPressReject={onPressReject}
      onPressSign={onPressSign}
    />
  );
};
