import React from 'react';

import {BackupWarning} from '@app/components/backup-warning';
import {app} from '@app/contexts/app';
import {useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';

export const BackupWarningScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'backupWarning'>();
  const wallet = useWallet(route.params.address);

  const onPressBackup = async () => {
    const password = await app.getPassword();
    const mnemonic = await wallet?.getMnemonic(password);
    navigation.navigate('backupCreate', {
      rootAddress: wallet?.rootAddress ?? '',
      mnemonic,
    });
  };

  return <BackupWarning onPressBackup={onPressBackup} />;
};
