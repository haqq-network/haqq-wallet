import React, {useCallback} from 'react';

import {observer} from 'mobx-react';

import {SettingsSecurityPin} from '@app/components/settings/settings-security-pin';
import {CustomHeader} from '@app/components/ui';
import {showModal} from '@app/helpers';
import {SecurePinUtils} from '@app/helpers/secure-pin-utils';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
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
      try {
        await SecurePinUtils.updatePin(pin);
        sendNotification(I18N.notificationPinChanged);
      } catch (e) {
        const details = (e as Error)?.message;
        showModal(ModalType.pinError, {details});
      }
      close();
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
