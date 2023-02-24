import React, {useCallback, useMemo} from 'react';

import {View} from 'react-native';

import {Button} from '@app/components/ui';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Wallet} from '@app/models/wallet';
import {WalletConnect} from '@app/services/wallet-connect';
import {getUserAddressFromSessionRequest} from '@app/utils';

export const WalletConnectSignScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'walletConnectSign'>();
  const event = useMemo(() => route?.params?.event, [route?.params?.event]);

  const onPressSign = useCallback(async () => {
    try {
      const wallet = Wallet.getById(getUserAddressFromSessionRequest(event));
      await WalletConnect.instance.approveEIP155Request(wallet!, event);
      navigation.goBack();
    } catch (err) {
      console.log('🔴 onPressApprove', err);
    }
  }, [event, navigation]);

  const onPressReject = useCallback(async () => {
    try {
      await WalletConnect.instance.rejectSessionRequest(event.id, event.topic);
      navigation.goBack();
    } catch (err) {
      console.log('🔴 onPressReject', err);
    }
  }, [event, navigation]);

  return (
    <View>
      <Button onPress={onPressSign} title="Sign" />
      <Button onPress={onPressReject} title="Reject" />
    </View>
  );
};
