import React, {useCallback} from 'react';

import {SettingsSecurityPin} from '@app/components/settings-security-pin';
import {app} from '@app/contexts';
import {getProviderInstanceForWallet, hideModal, showModal} from '@app/helpers';
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
      const viewed = new Set();

      for (const wallet of wallets) {
        if (viewed.has(wallet.accountId)) {
          const provider = getProviderInstanceForWallet(wallet);
          await provider.updatePin(pin);
          viewed.add(wallet.accountId);
        }
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
