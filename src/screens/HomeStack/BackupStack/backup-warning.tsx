import React, {memo} from 'react';

import {BackupWarning} from '@app/components/backup-warning';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  BackupStackParamList,
  BackupStackRoutes,
} from '@app/screens/HomeStack/BackupStack';

export const BackupWarningScreen = memo(() => {
  const navigation = useTypedNavigation<BackupStackParamList>();
  const route = useTypedRoute<
    BackupStackParamList,
    BackupStackRoutes.BackupWarning
  >();

  const onPressBackup = async () => {
    navigation.navigate(BackupStackRoutes.BackupCreate, {
      accountId: route.params.accountId,
    });
  };

  return (
    <BackupWarning onPressBackup={onPressBackup} testID="backup_warning" />
  );
});
