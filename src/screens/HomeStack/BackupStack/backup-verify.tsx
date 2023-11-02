import React, {memo, useCallback, useEffect, useRef, useState} from 'react';

import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';

import {BackupVerify} from '@app/components/backup-verify';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  BackupStackParamList,
  BackupStackRoutes,
} from '@app/screens/HomeStack/BackupStack';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const BackupVerifyScreen = memo(() => {
  const navigation = useTypedNavigation<BackupStackParamList>();
  const {accountId} = useTypedRoute<
    BackupStackParamList,
    BackupStackRoutes.BackupVerify
  >().params;
  const provider = useRef(
    new ProviderMnemonicReactNative({
      account: accountId,
      getPassword: app.getPassword.bind(app),
    }),
  ).current;

  const [mnemonic, setMnemonic] = useState<string | null>(null);

  useEffect(() => {
    provider.getMnemonicPhrase().then(phrase => setMnemonic(phrase));
  }, [accountId, provider]);

  const [error, setError] = useState<number | null>(null);

  const onDone = useCallback(
    async (selected: string) => {
      if (selected === mnemonic) {
        await provider.setMnemonicSaved();
        app.emit(Events.onWalletMnemonicSaved, provider.getIdentifier());
        navigation.navigate(BackupStackRoutes.BackupFinish);
      } else {
        vibrate(HapticEffects.error);
        setError(Math.random);
      }
    },
    [provider, navigation, mnemonic],
  );

  if (!mnemonic) {
    return <Loading />;
  }

  return (
    <BackupVerify
      error={!!error}
      phrase={mnemonic}
      onDone={onDone}
      key={error}
      testID="backup_verify"
    />
  );
});
