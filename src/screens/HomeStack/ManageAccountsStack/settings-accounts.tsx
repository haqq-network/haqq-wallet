import React, {memo, useCallback} from 'react';

import {SettingsAccounts} from '@app/components/settings-accounts';
import {useTypedNavigation, useWalletsList} from '@app/hooks';
import {
  ManageAccountsStackParamList,
  ManageAccountsStackRoutes,
} from '@app/screens/HomeStack/ManageAccountsStack';

export const SettingsAccountsScreen = memo(() => {
  const navigation = useTypedNavigation<ManageAccountsStackParamList>();
  const wallets = useWalletsList();

  const onPressRow = useCallback(
    (address: string) => {
      navigation.navigate(ManageAccountsStackRoutes.SettingsAccountDetail, {
        address,
      });
    },
    [navigation],
  );

  return <SettingsAccounts rows={wallets} onPressRow={onPressRow} />;
});
