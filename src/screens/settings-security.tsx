import React from 'react';

import {SettingsSecurity} from '@app/components/settings-security';
import {useTypedNavigation} from '@app/hooks';

import {PinGuardScreen} from './pin-guard';

export const SettingsSecurityScreen = () => {
  const navigation = useTypedNavigation();

  const onSubmit = () => {
    navigation.navigate('settingsSecurityPin');
  };

  return (
    <PinGuardScreen>
      <SettingsSecurity onSubmit={onSubmit} />
    </PinGuardScreen>
  );
};
