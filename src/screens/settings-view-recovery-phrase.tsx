import React, {useCallback, useState} from 'react';

import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';

import {SettingsViewRecoveryPhrase} from '@app/components/settings-view-recovery-phrase';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {useTypedRoute} from '@app/hooks';
import {Cloud} from '@app/services/cloud';
import {WalletType} from '@app/types';

import {PinGuardScreen} from './pin-guard';

export const SettingsViewRecoveryPhraseScreen = () => {
  const {accountId, type} =
    useTypedRoute<'settingsViewRecoveryPhrase'>().params;

  const [mnemonic, setMnemonic] = useState<string>('');

  const onEnter = useCallback(async () => {
    switch (type) {
      case WalletType.mnemonic:
        const providerMnemonic = new ProviderMnemonicReactNative({
          account: accountId,
          getPassword: app.getPassword.bind(app),
        });
        const phraseMnemonic = await providerMnemonic.getMnemonicPhrase();
        setMnemonic(phraseMnemonic ?? '');
        break;
      case WalletType.sss:
        const storage = new Cloud();
        const providerSss = new ProviderSSSReactNative({
          storage,
          account: accountId,
          getPassword: app.getPassword.bind(app),
        });

        const phraseSss = await providerSss.getMnemonicPhrase();
        setMnemonic(phraseSss ?? '');
        break;
    }
  }, [accountId, type]);

  return (
    <PinGuardScreen onEnter={onEnter}>
      {!mnemonic && <Loading />}
      {mnemonic && <SettingsViewRecoveryPhrase mnemonic={mnemonic} />}
    </PinGuardScreen>
  );
};
