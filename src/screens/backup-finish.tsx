import React from 'react';

import {BackupFinish} from '@app/components/backup-finish';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {useTypedNavigation} from '@app/hooks';
import {AdjustEvents} from '@app/types';

export const BackupFinishScreen = () => {
  const navigation = useTypedNavigation();

  const onSubmit = () => {
    onTrackEvent(AdjustEvents.backupCompleted);
    navigation.getParent()?.goBack();
  };

  return <BackupFinish onSubmit={onSubmit} />;
};
