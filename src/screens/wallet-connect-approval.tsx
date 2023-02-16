import React, {useCallback} from 'react';

import {View} from 'react-native';
import {Button} from '@app/components/ui';
import {WalletConnect} from '@app/services/wallet-connect';
import {useTypedRoute} from '@app/hooks';

export const WalletConnectApprovalScreen = () => {
  const route = useTypedRoute<'walletConnectApproval'>();

  const onPressApprove = useCallback(() => {
    const session = await WalletConnect.instance.approveSession(route.params.id, '', route.params.params);

    console.log('session', session)
  }, [])
  return <View>
    <Button onPress={onPressApprove} title="Approve" />

  </View>;
};
