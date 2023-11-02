import React, {useCallback} from 'react';

import {observer} from 'mobx-react';

import {SettingsAccounts} from '@app/components/settings-accounts';
import {useTypedNavigation} from '@app/hooks';
import {Wallet} from '@app/models/wallet';
import {
  ManageAccountsStackParamList,
  ManageAccountsStackRoutes,
} from '@app/screens/HomeStack/ManageAccountsStack';

export const SettingsAccountsScreen = observer(() => {
  const navigation = useTypedNavigation<ManageAccountsStackParamList>();
  const wallets = Wallet.getAll();

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
