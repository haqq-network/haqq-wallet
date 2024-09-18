import React, {memo, useEffect, useState} from 'react';

import {
  ProviderMnemonicBase,
  ProviderMnemonicEvm,
  ProviderSSSBase,
  ProviderSSSEvm,
} from '@haqq/rn-wallet-providers';
import {Alert} from 'react-native';
import {addScreenshotListener} from 'react-native-detector';

import {BackupCreate} from '@app/components/backup-create';
import {Loading} from '@app/components/ui';
import {getProviderInstanceForWallet} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {I18N, getText} from '@app/i18n';
import {BackupStackParamList, BackupStackRoutes} from '@app/route-types';

export const BackupCreateScreen = memo(() => {
  const navigation = useTypedNavigation<BackupStackParamList>();
  const {wallet} = useTypedRoute<
    BackupStackParamList,
    BackupStackRoutes.BackupCreate
  >().params;

  const [mnemonic, setMnemonic] = useState<string | null>(null);

  useEffectAsync(async () => {
    const provider = await getProviderInstanceForWallet(wallet, true);

    if (
      provider instanceof ProviderMnemonicBase ||
      provider instanceof ProviderMnemonicEvm ||
      provider instanceof ProviderSSSBase ||
      provider instanceof ProviderSSSEvm
    ) {
      provider.getMnemonicPhrase().then(phrase => setMnemonic(phrase));
    }
  }, [wallet]);

  const onSubmit = () => {
    navigation.navigate(BackupStackRoutes.BackupVerify, {
      wallet,
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
