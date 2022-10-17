import React, {useCallback, useRef, useState} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {Pin, PinInterface} from '../components/pin';
import {useApp} from '../contexts/app';
import {useWallets} from '../contexts/wallets';

export const SettingsSecurityPinScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const app = useApp();
  const wallets = useWallets();
  const pinRef = useRef<PinInterface>();
  const [pin, setPin] = useState('');
  const onPin = useCallback((newPin: string) => {
    setPin(newPin);
  }, []);

  const onPinRepeated = useCallback(
    async (repeatedPin: string) => {
      if (pin === repeatedPin) {
        app.emit('modal', {type: 'loading'});
        await wallets.updateWalletsData(pin);
        await app.updatePin(pin);
        app.emit('modal', null);
        app.emit('notification', 'PIN code successfully changed');
        navigation.goBack();
      } else {
        pinRef.current?.reset('pin not matched');
        setPin('');
      }
    },
    [app, navigation, pin, wallets],
  );

  if (pin === '') {
    return <Pin onPin={onPin} title="Set 6-digital pin code" key="enter" />;
  }

  return (
    <Pin
      onPin={onPinRepeated}
      title="Please repeat pin code"
      ref={pinRef}
      key="confirm"
    />
  );
};
