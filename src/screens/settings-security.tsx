import React, {useCallback, useState} from 'react';

import {Alert} from 'react-native';

import {SettingsSecurity} from '@app/components/settings-security';
import {app} from '@app/contexts';
import {useTypedNavigation} from '@app/hooks';

import {PinGuardScreen} from './pin-guard';

export const SettingsSecurityScreen = () => {
  const navigation = useTypedNavigation();
  const [biometry, setBiometry] = useState(app.biometry);

  const onSubmit = () => {
    navigation.navigate('settingsSecurityPin');
  };

  const onToggleBiometry = useCallback(async () => {
    if (!biometry) {
      try {
        await app.biometryAuth();
        app.biometry = true;
        setBiometry(true);
      } catch (e) {
        if (e instanceof Error) {
          Alert.alert(e.message);
        }
        app.biometry = false;
        setBiometry(false);
      }
    } else {
      app.biometry = false;
      setBiometry(false);
    }
  }, [biometry]);

  return (
    <PinGuardScreen>
      <SettingsSecurity
        onSubmit={onSubmit}
        onToggleBiometry={onToggleBiometry}
        biometry={biometry}
        biometryType={app.biometryType}
      />
    </PinGuardScreen>
  );
};
