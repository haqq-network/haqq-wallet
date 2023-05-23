import React, {useEffect, useRef, useState} from 'react';

import {PinInterface} from '@app/components/pin';
import {PinGuard} from '@app/components/pin-guard';
import {app} from '@app/contexts';
import {captureException, hideModal, showModal} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {PIN_BANNED_ATTEMPTS} from '@app/variables/common';

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

  useEffect(() => {
    if (app.pinBanned) {
      pinRef?.current?.locked(app.pinBanned);
    }
  }, [pinRef]);

  const onPin = async (pin: string) => {
    const start = Date.now();
    showModal('loading');
    try {
      await app.comparePin(pin);
      app.successEnter();
      await onEnter?.();
      pinRef.current?.reset();
      setLoggedIn(true);
    } catch (error) {
      app.failureEnter();
      if (app.canEnter) {
        pinRef.current?.reset(
          getText(I18N.pinCodeWrongPin, {
            attempts: String(PIN_BANNED_ATTEMPTS - app.pinAttempts),
          }),
        );
      } else {
        pinRef.current?.locked(app.pinBanned);
      }

      captureException(error, 'pin-guard');
    }

    // @todo: wtf???
    const end = Date.now();
    if (end - start < 500) {
      setTimeout(() => hideModal('loading'), 1000);
    } else {
      hideModal('loading');
    }
  };

  if (!loggedIn) {
    return <PinGuard pinRef={pinRef} onPin={onPin} />;
  }
  return children;
};
