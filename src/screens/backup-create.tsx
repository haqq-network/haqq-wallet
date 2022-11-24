import React from 'react';

import {BackupCreate} from '@app/components/backup-create';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const BackupCreateScreen = () => {
  const navigation = useTypedNavigation();
  const {mnemonic, rootAddress} = useTypedRoute<'backupCreate'>().params;

  const onSubmit = () => {
    navigation.navigate('backupVerify', {
      rootAddress,
      mnemonic,
    });
  };

  return <BackupCreate onSubmit={onSubmit} />;
};
