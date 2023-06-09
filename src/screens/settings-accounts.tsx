import React, {useCallback} from 'react';

import {SettingsAccounts} from '@app/components/settings-accounts';
import {useTypedNavigation, useWalletsList} from '@app/hooks';

export const SettingsAccountsScreen = () => {
  const navigation = useTypedNavigation();
  const wallets = useWalletsList();

  const onPressRow = useCallback(
    (address: string) => {
      navigation.navigate('settingsAccountDetail', {
        address,
      });
    },
    [navigation],
  );

  return <SettingsAccounts rows={wallets} onPressRow={onPressRow} />;
};
