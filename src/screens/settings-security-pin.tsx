import React, {useCallback, useRef, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Pin, PinInterface} from '../components/pin';
import {useApp} from '../contexts/app';
import {useWallets} from '../contexts/wallets';

type SettingsSecurityPinScreenProps = CompositeScreenProps<any, any>;

export const SettingsSecurityPinScreen = ({
  navigation,
}: SettingsSecurityPinScreenProps) => {
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
