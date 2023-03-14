import React, {useCallback, useEffect} from 'react';

import {BottomPopupContainer} from '@app/components/bottom-popups';
import {BackupMpcSuggestion} from '@app/components/bottom-popups/popup-backup-mpc-suggestion';
import {useApp, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {navigator} from '@app/navigator';
import {customAuthInit} from '@app/services/provider-mpc';

export const BackupMpcSuggestionScreen = () => {
  const {goBack} = useTypedNavigation();
  const {accountId} = useTypedRoute<'backupMpcSuggestion'>().params;

  const app = useApp();

  useEffect(() => {
    customAuthInit();
  }, []);

  const onClickBackup = useCallback(
    async (onDone: () => void) => {
      if (accountId) {
        goBack();
        navigator.navigate('mpcMigrate', {
          accountId,
        });
        onDone();
      }
    },
    [accountId, goBack],
  );

  const onClickSkip = useCallback(
    (onDone: () => void) => {
      app.setSnoozeBackup();
      goBack();
      onDone();

      return Promise.resolve();
    },
    [app, goBack],
  );

  return (
    <BottomPopupContainer>
      {onClose => (
        <BackupMpcSuggestion
          onClickBackup={() => onClickBackup(onClose)}
          onClickSkip={() => onClickSkip(onClose)}
        />
      )}
    </BottomPopupContainer>
  );
};
