import React, {memo, useCallback, useState} from 'react';

import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';

import {SettingsViewRecoveryPhrase} from '@app/components/settings-view-recovery-phrase';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {useTypedRoute} from '@app/hooks';
import {
  ManageAccountsStackParamList,
  ManageAccountsStackRoutes,
} from '@app/screens/HomeStack/ManageAccountsStack';

import {PinGuardScreen} from '../../pin-guard';

export const SettingsViewRecoveryPhraseScreen = memo(() => {
  const {accountId} = useTypedRoute<
    ManageAccountsStackParamList,
    ManageAccountsStackRoutes.SettingsViewRecoveryPhrase
  >().params;

  const [mnemonic, setMnemonic] = useState<string>('');

  const onEnter = useCallback(async () => {
    const provider = new ProviderMnemonicReactNative({
      account: accountId,
      getPassword: app.getPassword.bind(app),
    });

    const phrase = await provider.getMnemonicPhrase();

    setMnemonic(phrase ?? '');
  }, [accountId]);

  return (
    <PinGuardScreen onEnter={onEnter}>
      {!mnemonic && <Loading />}
      {mnemonic && <SettingsViewRecoveryPhrase mnemonic={mnemonic} />}
    </PinGuardScreen>
  );
});
