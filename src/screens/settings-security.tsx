import React, {useCallback, useState} from 'react';

import {Alert} from 'react-native';

import {SettingsSecurity} from '@app/components/settings-security';
import {app} from '@app/contexts';
import {useTypedNavigation, useUser} from '@app/hooks';

import {PinGuardScreen} from './pin-guard';

export const SettingsSecurityScreen = () => {
  const navigation = useTypedNavigation();
  const user = useUser();
  const [biometry, setBiometry] = useState(user.biometry);

  const onSubmit = () => {
    navigation.navigate('settingsSecurityPin');
  };

  const onToggleBiometry = useCallback(async () => {
    if (!biometry) {
      try {
        await app.biometryAuth();
        user.biometry = true;
        setBiometry(true);
      } catch (e) {
        if (e instanceof Error) {
          Alert.alert(e.message);
        }
        user.biometry = false;
        setBiometry(false);
      }
    } else {
      user.biometry = false;
      setBiometry(false);
    }
  }, [biometry, user]);

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
