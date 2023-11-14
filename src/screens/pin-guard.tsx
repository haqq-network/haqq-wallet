import React, {memo, useEffect, useRef, useState} from 'react';

import {PinInterface} from '@app/components/pin';
import {PinGuard} from '@app/components/pin-guard';
import {app} from '@app/contexts';
import {hideModal, showModal} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {ModalType} from '@app/types';
import {PIN_BANNED_ATTEMPTS} from '@app/variables/common';

interface PinGuardProps {
  onEnter?: () => Promise<void> | void;
  children?: any;
}

export const PinGuardScreen = memo(
  ({onEnter, children = null}: PinGuardProps) => {
    const pinRef = useRef<PinInterface>();
    const {setOptions} = useTypedNavigation();
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
      setOptions({headerStyle: {display: loggedIn ? 'flex' : 'none'}});
    }, [loggedIn, setOptions]);

    useEffect(() => {
      if (app.pinBanned) {
        pinRef?.current?.locked(app.pinBanned);
      }
    }, [pinRef]);

    const onPin = async (pin: string) => {
      showModal(ModalType.loading);
      try {
        console.log('1');
        await app.comparePin(pin);
        console.log('2');
        app.successEnter();
        console.log('3');
        await onEnter?.();
        console.log('4');
        pinRef.current?.reset();
        console.log('5');
        setLoggedIn(true);
        console.log('6');
      } catch (error) {
        console.log('error', error);
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
      } finally {
        hideModal(ModalType.loading);
      }
    };

    if (!loggedIn) {
      return <PinGuard pinRef={pinRef} onPin={onPin} />;
    }
    return children;
  },
);
