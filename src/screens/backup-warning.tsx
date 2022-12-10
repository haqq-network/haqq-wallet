import React, {useMemo} from 'react';

import {BackupWarning} from '@app/components/backup-warning';
import {app} from '@app/contexts/app';
import {useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';

export const BackupWarningScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'backupWarning'>();
  const wallet = useWallet(route.params.address);
  const theme = useTheme();

  const animation = useMemo(() => {
    if (theme === AppTheme.dark) {
      return require('../../assets/animations/backup-start-dark.json');
    }

    return require('../../assets/animations/backup-start-light.json');
  }, [theme]);

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

