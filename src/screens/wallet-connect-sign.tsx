import React, {useCallback, useMemo} from 'react';

import {View} from 'react-native';

import {Button} from '@app/components/ui';
import {useTypedRoute} from '@app/hooks';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {WalletConnect} from '@app/services/wallet-connect';

export const WalletConnectSignScreen = () => {
  const route = useTypedRoute<'walletConnectSign'>();
  const event = useMemo(() => route?.params?.event, [route?.params?.event]);

  const onPressSign = useCallback(async () => {
    try {
      // TODO: make a choice of wallet
      const wallets = Wallet.getAll();
      const wallet = wallets[0];
      await WalletConnect.instance.approveEIP155Request(wallet, event);
      navigator.goBack();
    } catch (err) {
      console.log('🔴 onPressApprove', err);
    }
  }, [event]);
  return (
    <View>
      <Button onPress={onPressSign} title="Sign" />
    </View>
  );
};
