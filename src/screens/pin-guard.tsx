import React from 'react';

import {PinGuard} from '@app/components/pin-guard';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute, useWallets} from '@app/hooks';

export const PinGuardScreen = () => {
  const navigation = useTypedNavigation();
  const {address, nextScreen} = useTypedRoute<'pinGuard'>().params;
  const wallets = useWallets();

  const onSuccess = async () => {
    if (address && nextScreen === 'viewRecoveryPhrase') {
      const password = await app.getPassword();
      const mnemonic = await wallets.getWallet(address)?.getMnemonic(password);
      navigation.replace('settingsViewRecoveryPhrase', {
        mnemonic,
      });
    } else if (nextScreen === 'settingsSecurity') {
      navigation.replace('settingsSecurity');
    }
  };

  return <PinGuard onSuccess={onSuccess} />;
};
