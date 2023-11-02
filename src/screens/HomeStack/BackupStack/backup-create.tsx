import React, {memo, useEffect, useState} from 'react';

import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {Alert} from 'react-native';
import {addScreenshotListener} from 'react-native-detector';

import {BackupCreate} from '@app/components/backup-create';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  BackupStackParamList,
  BackupStackRoutes,
} from '@app/screens/HomeStack/BackupStack';

export const BackupCreateScreen = memo(() => {
  const navigation = useTypedNavigation<BackupStackParamList>();
  const {accountId} = useTypedRoute<
    BackupStackParamList,
    BackupStackRoutes.BackupCreate
  >().params;

  const [mnemonic, setMnemonic] = useState<string | null>(null);

  useEffect(() => {
    const provider = new ProviderMnemonicReactNative({
      account: accountId,
      getPassword: app.getPassword.bind(app),
    });

    provider.getMnemonicPhrase().then(phrase => setMnemonic(phrase));
  }, [accountId]);

  const onSubmit = () => {
    navigation.navigate(BackupStackRoutes.BackupVerify, {
      accountId,
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
    const subscription = addScreenshotListener(onScreenshot);
    return () => {
      subscription();
    };
  }, []);

  if (!mnemonic) {
    return <Loading />;
  }

  return (
    <BackupCreate
      onSubmit={onSubmit}
      mnemonic={mnemonic}
      testID="backup_create"
    />
  );
});
