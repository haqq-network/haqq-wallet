import React, {useCallback, useMemo} from 'react';

import {View} from 'react-native';

import {Button} from '@app/components/ui';
import {useTypedRoute} from '@app/hooks';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {WalletConnect} from '@app/services/wallet-connect';

export const WalletConnectApprovalScreen = () => {
  const route = useTypedRoute<'walletConnectApproval'>();
  const event = useMemo(() => route?.params?.event, [route?.params?.event]);

  const onPressApprove = useCallback(async () => {
    const wallets = Wallet.getAll();

    const session = await WalletConnect.instance.approveSession(
      event.id,
      wallets[1].address,
      event.params,
    );
    console.log('session', session);
    navigator.goBack();
  }, [event]);

  return (
    <View>
      <Button onPress={onPressApprove} title="Approve" />
    </View>
  );
};
