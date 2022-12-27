import React, {useState} from 'react';

import {PinGuard} from '@app/components/pin-guard';
import {SettingsViewRecoveryPhrase} from '@app/components/settings-view-recovery-phrase';
import {app, wallets} from '@app/contexts';
import {useTypedRoute} from '@app/hooks';

export const SettingsViewRecoveryPhraseScreen = () => {
  const {address} = useTypedRoute<'settingsViewRecoveryPhrase'>().params;
  const [mnemonic, setMnemonic] = useState('');

  const onSuccess = async () => {
    const password = await app.getPassword();
    setMnemonic(await wallets.getWallet(address)?.getMnemonic(password));
  };

  return (
    <PinGuard onSuccess={onSuccess}>
      <SettingsViewRecoveryPhrase mnemonic={mnemonic} />
    </PinGuard>
  );
};
