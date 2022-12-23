import React from 'react';

import {SettingsSecurityPinMnemonic} from '@app/components/settings-security-pin-mnemonic';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute, useWallets} from '@app/hooks';

export const SettingsSecurityPinMnemonicScreen = () => {
  const navigation = useTypedNavigation();
  const {address} = useTypedRoute<'settingsSecurityPinMnemonic'>().params;
  const wallets = useWallets();

  const onSuccess = async () => {
    const password = await app.getPassword();
    const mnemonic = await wallets.getWallet(address)?.getMnemonic(password);
    navigation.replace('settingsViewRecoveryPhrase', {
      mnemonic,
    });
  };

  return <SettingsSecurityPinMnemonic onSuccess={onSuccess} />;
};
