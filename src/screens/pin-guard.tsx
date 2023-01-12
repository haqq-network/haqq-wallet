import React, {useEffect, useRef, useState} from 'react';

import {PinInterface} from '@app/components/pin';
import {PinGuard} from '@app/components/pin-guard';
import {app} from '@app/contexts';
import {captureException, hideModal, showModal} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {I18N, getText} from '@app/i18n';

interface PinGuardProps {
  onEnter?: () => Promise<void> | void;
  children?: any;
}

export const PinGuardScreen = ({onEnter, children = <></>}: PinGuardProps) => {
  const pinRef = useRef<PinInterface>();
  const {setOptions} = useTypedNavigation();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setOptions({headerShown: loggedIn});
  }, [loggedIn, setOptions]);

  const onPin = async (pin: string) => {
    const start = Date.now();
    showModal('loading');
    try {
      await app.comparePin(pin);
      await onEnter?.();
      pinRef.current?.reset();
      setLoggedIn(true);
    } catch (error) {
      pinRef.current?.reset(getText(I18N.settingsSecurityPinNotMatched));
      captureException(error, 'settings-security-pin-mnemonic');
    }
    const end = Date.now();
    if (end - start < 500) {
      setTimeout(() => hideModal(), 1000);
    } else {
      hideModal();
    }
  };

  if (!loggedIn) {
    return <PinGuard pinRef={pinRef} onPin={onPin} />;
  }
  return children;
};
