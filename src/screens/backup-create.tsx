import React, {useEffect, useState} from 'react';

import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {Alert} from 'react-native';
import {addScreenshotListener} from 'react-native-detector';

import {BackupCreate} from '@app/components/backup-create';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';

export const BackupCreateScreen = () => {
  const navigation = useTypedNavigation();
  const {accountId} = useTypedRoute<'backupCreate'>().params;

  const [mnemonic, setMnemonic] = useState<string | null>(null);

  useEffect(() => {
    const provider = new ProviderMnemonicReactNative({
      account: accountId,
      getPassword: app.getPassword.bind(app),
    });

    provider.getMnemonicPhrase().then(phrase => setMnemonic(phrase));
  }, [accountId]);

  const onSubmit = () => {
    navigation.navigate('backupVerify', {
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
};
