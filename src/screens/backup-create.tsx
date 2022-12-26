import React, {useEffect} from 'react';

import {Alert} from 'react-native';
import {addScreenshotListener} from 'react-native-detector';

import {BackupCreate} from '@app/components/backup-create';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';

export const BackupCreateScreen = () => {
  const navigation = useTypedNavigation();
  const {mnemonic, rootAddress} = useTypedRoute<'backupCreate'>().params;

  const onSubmit = () => {
    navigation.navigate('backupVerify', {
      rootAddress,
      mnemonic,
    });
  };

  useEffect(() => {
    const onScreenshot = () => {
      Alert.alert(
        getText(I18N.backupCreateScreenshotWarningTitle),
        getText(I18N.backupCreateScreenshotWarningSubtitle),
        [
          {
            style: 'default',
            text: getText(I18N.backupWarningButton),
          },
        ],
        {
          cancelable: true,
        },
      );
    };
    const unsubscribe = addScreenshotListener(onScreenshot);
    return unsubscribe;
  }, []);

  return <BackupCreate onSubmit={onSubmit} />;
};
