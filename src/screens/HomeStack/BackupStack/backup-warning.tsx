import React, {memo} from 'react';

import {BackupWarning} from '@app/components/backup-warning';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {BackupStackParamList, BackupStackRoutes} from '@app/route-types';
import {PinGuardScreen} from '@app/screens/pin-guard';

export const BackupWarningScreen = memo(() => {
  const navigation = useTypedNavigation<BackupStackParamList>();
  const route = useTypedRoute<
    BackupStackParamList,
    BackupStackRoutes.BackupWarning
  >();

  const onPressBackup = async () => {
    navigation.navigate(BackupStackRoutes.BackupCreate, {
      wallet: route.params.wallet,
    });
  };

  return (
    <PinGuardScreen enabled={route.params.pinEnabled}>
      <BackupWarning onPressBackup={onPressBackup} testID="backup_warning" />
    </PinGuardScreen>
  );
});
