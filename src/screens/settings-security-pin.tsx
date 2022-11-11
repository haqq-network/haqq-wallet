import React, {useCallback, useRef, useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {Pin, PinInterface} from '../components/pin';
import {useApp} from '../contexts/app';
import {useWallets} from '../contexts/wallets';
import {hideModal, showModal} from '../helpers/modal';
import {RootStackParamList} from '../types';

export const SettingsSecurityPinScreen = () => {
  const {goBack} = useNavigation<StackNavigationProp<RootStackParamList>>();
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
        app.emit('notification', 'PIN code successfully changed');
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
