import React, {useCallback} from 'react';

import {WalletProtection} from '@app/components/wallet-protection';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const WalletProtectionScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'walletProtectionPopup'>();
  const accountId = route.params?.accountId;

  const onPressPharse = useCallback(() => {
    navigation.navigate('backup', {accountId});
  }, [accountId, navigation]);

  const onPressSocial = useCallback(() => {
    navigation.navigate('backupMpcNotification', {accountId});
  }, [accountId, navigation]);

  return (
    <WalletProtection
      onPressPharse={onPressPharse}
      onPressSocial={onPressSocial}
    />
  );
};
