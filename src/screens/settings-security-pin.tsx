import React, {useCallback, useRef, useState} from 'react';

import {Pin, PinInterface} from '@app/components/pin';
import {hideModal, showModal} from '@app/helpers';
import {useApp, useTypedNavigation, useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';

export const SettingsSecurityPinScreen = () => {
  const {goBack} = useTypedNavigation();
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
        app.emit('notification', getText(I18N.notificationPinChanged));
        goBack();
      } else {
        pinRef.current?.reset('Pin not matched');
        setPin('');
      }
    },
    [app, goBack, pin, wallets],
  );

  return (
    <Pin
      onPin={isRepeatPin ? onPinRepeated : onPin}
      title={isRepeatPin ? 'Please repeat pin code' : 'Set 6-digital pin code'}
      ref={pinRef}
      key={isRepeatPin ? 'enter' : 'confirm'}
    />
  );
};
