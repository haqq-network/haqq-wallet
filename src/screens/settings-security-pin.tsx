import React, {useCallback} from 'react';

import {SettingsSecurityPin} from '@app/components/settings-security-pin';
import {app} from '@app/contexts';
import {hideModal, showModal} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {sendNotification} from '@app/services';

export const SettingsSecurityPinScreen = () => {
  const {goBack} = useTypedNavigation();

  const onPinRepeated = useCallback(
    async (pin: string, repeatedPin: string) => {
      if (pin !== repeatedPin) {
        return false;
      }
      showModal('loading');
      const wallets = Wallet.getAll();
      const oldPin = await app.getPassword();
      for (const wallet of wallets) {
        await wallet.updateWalletData(oldPin, pin);
      }
      await app.updatePin(pin);
      hideModal();
      sendNotification(I18N.notificationPinChanged);
      goBack();
      return true;
    },
    [goBack],
  );

  return <SettingsSecurityPin onPinRepeated={onPinRepeated} />;
};
