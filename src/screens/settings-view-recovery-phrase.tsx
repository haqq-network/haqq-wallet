import React, {useState} from 'react';

import {SettingsViewRecoveryPhrase} from '@app/components/settings-view-recovery-phrase';
import {app} from '@app/contexts';
import {useTypedRoute, useWallet} from '@app/hooks';

import {PinGuardScreen} from './pin-guard';

export const SettingsViewRecoveryPhraseScreen = () => {
  const {address} = useTypedRoute<'settingsViewRecoveryPhrase'>().params;
  const wallet = useWallet(address);
  const [mnemonic, setMnemonic] = useState<string>('');

  const onEnter = async () => {
    const password = await app.getPassword();
    const m = await wallet?.getMnemonic(password);

    setMnemonic(m ?? '');
  };

  return (
    <PinGuardScreen onEnter={onEnter}>
      {mnemonic && <SettingsViewRecoveryPhrase mnemonic={mnemonic} />}
    </PinGuardScreen>
  );
};
