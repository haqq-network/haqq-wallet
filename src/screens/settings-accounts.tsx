import React, {useCallback, useEffect, useState} from 'react';

import {SettingsAccounts} from '@app/components/settings-accounts';
import {useTypedNavigation, useWallets} from '@app/hooks';

export const SettingsAccountsScreen = () => {
  const navigation = useTypedNavigation();
  const wallets = useWallets();
  const [rows, setRows] = useState(wallets.getWallets());

  useEffect(() => {
    setRows(wallets.getWallets());

    const callback = () => {
      setRows(wallets.getWallets());
    };

    wallets.on('wallets', callback);
    return () => {
      wallets.off('wallets', callback);
    };
  }, [wallets]);

  const onPressRow = useCallback(
    (address: string) => {
      navigation.navigate('settingsAccountDetail', {
        address,
      });
    },
    [navigation],
  );

  return <SettingsAccounts rows={rows} onPressRow={onPressRow} />;
};
