import React, {useCallback} from 'react';

import {observer} from 'mobx-react';

import {SettingsSecurityPin} from '@app/components/settings-security-pin';
import {CustomHeader} from '@app/components/ui';
import {app} from '@app/contexts';
import {getProviderInstanceForWallet, showModal} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {SecurityStackParamList} from '@app/route-types';
import {sendNotification} from '@app/services';
import {ModalType} from '@app/types';

export const SettingsSecurityPinScreen = observer(() => {
  const {goBack} = useTypedNavigation<SecurityStackParamList>();

  const onPinRepeated = useCallback(
    async (pin: string, repeatedPin: string) => {
      if (pin !== repeatedPin) {
        return false;
      }
      const close = showModal(ModalType.loading);
      const wallets = Wallet.getAll();
      const viewed = new Set();

      for (const wallet of wallets) {
        if (!viewed.has(wallet.accountId)) {
          const provider = await getProviderInstanceForWallet(
            wallet,
            true,
            true,
          );
          await provider.updatePin(pin);
          viewed.add(wallet.accountId);
        }
      }
      await app.setPin(pin);
      close();
      sendNotification(I18N.notificationPinChanged);
      goBack();
      return true;
    },
    [goBack],
  );

  return (
    <>
      <CustomHeader
        onPressLeft={goBack}
        iconLeft="arrow_back"
        title={I18N.settingsSecurityChangePin}
      />
      <SettingsSecurityPin onPinRepeated={onPinRepeated} />
    </>
  );
});
