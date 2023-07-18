import React from 'react';

import {BackupWarning} from '@app/components/backup-warning';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const BackupWarningScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'backupWarning'>();

  const onPressBackup = async () => {
    navigation.navigate('backupCreate', {
      accountId: route.params.accountId,
    });
  };

  return (
    <BackupWarning onPressBackup={onPressBackup} testID="backup_warning" />
  );
};
