import React, {memo, useCallback} from 'react';

import {addMinutes} from 'date-fns';

import {BottomPopupContainer} from '@app/components/bottom-popups';
import {BackupSssSuggestion} from '@app/components/bottom-popups/popup-backup-sss-suggestion';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {VariablesDate} from '@app/models/variables-date';
import {navigator} from '@app/navigator';
import {HomeStackRoutes} from '@app/screens/HomeStack';
import {
  SettingsStackParamList,
  SettingsStackRoutes,
} from '@app/screens/HomeStack/SettingsStack';
import {SNOOZE_WALLET_BACKUP_MINUTES} from '@app/variables/common';

export const BackupSssSuggestionScreen = memo(() => {
  const {goBack} = useTypedNavigation<SettingsStackParamList>();
  const {accountId} = useTypedRoute<
    SettingsStackParamList,
    SettingsStackRoutes.BackupSssSuggestion
  >().params;

  const onClickBackup = useCallback(
    async (onDone: () => void) => {
      if (accountId) {
        goBack();
        //FIXME: Test this
        navigator.navigate(HomeStackRoutes.SssMigrate, {
          accountId,
        });
        onDone();
      }
    },
    [accountId, goBack],
  );

  const onClickSkip = useCallback(
    (onDone: () => void) => {
      VariablesDate.set(
        'appBackupSnooze',
        addMinutes(new Date(), SNOOZE_WALLET_BACKUP_MINUTES),
      );

      goBack();
      onDone();

      return Promise.resolve();
    },
    [goBack],
  );

  return (
    <BottomPopupContainer>
      {onClose => (
        <BackupSssSuggestion
          onClickBackup={() => onClickBackup(onClose)}
          onClickSkip={() => onClickSkip(onClose)}
        />
      )}
    </BottomPopupContainer>
  );
});
