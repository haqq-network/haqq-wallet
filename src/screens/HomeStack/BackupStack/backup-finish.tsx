import React from 'react';

import {BackupFinish} from '@app/components/backup-finish';
import {useTypedNavigation} from '@app/hooks';
import {EventTracker} from '@app/services/event-tracker';
import {MarketingEvents} from '@app/types';

export const BackupFinishScreen = () => {
  const navigation = useTypedNavigation();

  const onSubmit = () => {
    EventTracker.instance.trackEvent(MarketingEvents.backupCompleted);
    navigation.navigate('home');
  };

  return <BackupFinish onSubmit={onSubmit} testID="backup_finish" />;
};
