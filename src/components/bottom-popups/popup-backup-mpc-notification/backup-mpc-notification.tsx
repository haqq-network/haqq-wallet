import React, {useCallback, useState} from 'react';

import {Alert, View} from 'react-native';

import {Color} from '@app/colors';
import {Button, ButtonSize, ButtonVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';

export type BackupMpcNotificationProps = {
  onClickBackup: () => Promise<void>;
  onClickSkip: () => Promise<void>;
  onClickCheck: () => Promise<void>;
};

export const BackupMpcNotification = ({
  onClickBackup,
  onClickSkip,
  onClickCheck,
}: BackupMpcNotificationProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const onSkip = useCallback(() => {
    return Alert.alert(
      getText(I18N.backupNotificationAlertTitle),
      getText(I18N.backupNotificationAlertDescription),
      [
        {
          text: getText(I18N.cancel),
          style: 'cancel',
        },
        {
          text: getText(I18N.accept),
          style: 'destructive',
          onPress: onClickSkip,
        },
      ],
    );
  }, [onClickSkip]);

  const onPressCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      await onClickCheck();
    } finally {
      setIsChecking(false);
    }
  }, [onClickCheck]);

  const onPressBackup = useCallback(async () => {
    setIsSaving(true);
    try {
      await onClickBackup();
    } finally {
      setIsSaving(false);
    }
  }, [onClickBackup]);

  return (
    <View style={styles.sub}>
      <Button
        i18n={I18N.backupMpcNotificationCheck}
        variant={ButtonVariant.contained}
        loading={isChecking}
        onPress={onPressCheck}
        style={styles.margin}
        size={ButtonSize.middle}
      />
      <Button
        i18n={I18N.backupMpcNotificationBackup}
        variant={ButtonVariant.contained}
        onPress={onPressBackup}
        loading={isSaving}
        style={styles.margin}
        size={ButtonSize.middle}
      />
      <Button
        i18n={I18N.backupNotificationSkip}
        variant={ButtonVariant.third}
        error
        onPress={onSkip}
        size={ButtonSize.middle}
        style={styles.margin}
      />
    </View>
  );
};

const styles = createTheme({
  sub: {
    marginHorizontal: 16,
    marginVertical: 42,
    backgroundColor: Color.bg1,
    flex: 0,
    padding: 24,
    borderRadius: 16,
    paddingBottom: 16,
  },
  margin: {marginVertical: 8},
});
