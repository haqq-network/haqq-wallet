import React, {useEffect, useRef, useState} from 'react';

import {Pin, PinInterface} from '@app/components/pin';
import {app} from '@app/contexts';
import {captureException, hideModal, showModal} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {I18N, getText} from '@app/i18n';

import {CustomHeader} from '../ui';

interface PinGuardProps {
  onSuccess?: () => Promise<void> | void;
  children?: JSX.Element;
}

export const PinGuard = ({onSuccess, children = <></>}: PinGuardProps) => {
  const pinRef = useRef<PinInterface>();
  const {setOptions, goBack} = useTypedNavigation();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setOptions({headerShown: loggedIn});
  }, [loggedIn, setOptions]);

  const onPin = async (pin: string) => {
    const start = Date.now();
    showModal('loading');
    try {
      await app.comparePin(pin);
      await onSuccess?.();
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
    return (
      <>
        <CustomHeader
          onPressLeft={goBack}
          iconLeft="arrow_back"
          title={I18N.settingsSecurity}
        />
        <Pin
          title={I18N.settingsSecurityWalletPin}
          onPin={onPin}
          ref={pinRef}
        />
      </>
    );
  }
  return children;
};
