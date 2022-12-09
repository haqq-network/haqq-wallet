import React, {useCallback, useRef, useState} from 'react';

import {Pin, PinInterface} from '@app/components/pin';
import {hideModal, sendNotification, showModal} from '@app/helpers';
import {useApp, useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';

interface SettingsSecurityPinProps {
  goBack?: () => void;
}

export const SettingsSecurityPin = ({
  goBack = () => {},
}: SettingsSecurityPinProps) => {
  const app = useApp();
  const wallets = useWallets();
  const pinRef = useRef<PinInterface>();
  const [pin, setPin] = useState('');
  const [isRepeatPin, setIsRepeatPin] = useState(false);
  const onPin = useCallback((newPin: string) => {
    setPin(newPin);
    setIsRepeatPin(true);
  }, []);

  const onPinRepeated = useCallback(
    async (repeatedPin: string) => {
      if (pin === repeatedPin) {
        showModal('loading');
        await wallets.updateWalletsData(pin);
        await app.updatePin(pin);
        hideModal();
        sendNotification(I18N.notificationPinChanged);
        goBack();
      } else {
        pinRef.current?.reset(getText(I18N.settingsSecurityPinNotMatched));
      }
    },
    [app, goBack, pin, wallets],
  );

  return (
    <Pin
      onPin={isRepeatPin ? onPinRepeated : onPin}
      title={
        isRepeatPin
          ? getText(I18N.settingsSecurityPinRepeat)
          : getText(I18N.settingsSecurityPinSet)
      }
      ref={pinRef}
      key={
        isRepeatPin
          ? getText(I18N.settingsSecurityPinEnter)
          : getText(I18N.settingsSecurityPinConfirm)
      }
    />
  );
};
