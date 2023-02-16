import React, {useCallback} from 'react';

import {View} from 'react-native';

import {Button} from '@app/components/ui';
import {useTypedRoute} from '@app/hooks';
import {WalletConnect} from '@app/services/wallet-connect';

export const WalletConnectApprovalScreen = () => {
  const route = useTypedRoute<'walletConnectApproval'>();

  const onPressApprove = useCallback(async () => {
    const session = await WalletConnect.instance.approveSession(
      route.params.id,
      '',
      route.params.params,
    );

    console.log('session', session);
  }, [route]);
  return (
    <View>
      <Button onPress={onPressApprove} title="Approve" />
    </View>
  );
};
