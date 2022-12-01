import React from 'react';

import {BackupFinish} from '@app/components/backup-finish';
import {useTypedNavigation} from '@app/hooks';

export const BackupFinishScreen = () => {
  const navigation = useTypedNavigation();

  const onSubmit = () => {
    navigation.getParent()?.goBack();
  };

  return <BackupFinish onSubmit={onSubmit} />;
};
