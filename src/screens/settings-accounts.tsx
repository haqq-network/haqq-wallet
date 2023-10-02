import React, {useCallback} from 'react';

import {observer} from 'mobx-react';

import {SettingsAccounts} from '@app/components/settings-accounts';
import {useTypedNavigation} from '@app/hooks';
import {Wallet} from '@app/models/wallet';

export const SettingsAccountsScreen = observer(() => {
  const navigation = useTypedNavigation();
  const wallets = Wallet.getAll();

  const onPressRow = useCallback(
    (address: string) => {
      navigation.navigate('settingsAccountDetail', {
        address,
      });
    },
    [navigation],
  );

  return <SettingsAccounts rows={wallets} onPressRow={onPressRow} />;
});
