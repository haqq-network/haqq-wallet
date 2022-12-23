import React from 'react';

import {SettingsViewRecoveryPhrase} from '@app/components/settings-view-recovery-phrase';
import {useTypedRoute} from '@app/hooks';

export const SettingsViewRecoveryPhraseScreen = () => {
  const {mnemonic} = useTypedRoute<'settingsViewRecoveryPhrase'>().params;

  return <SettingsViewRecoveryPhrase mnemonic={mnemonic} />;
};
