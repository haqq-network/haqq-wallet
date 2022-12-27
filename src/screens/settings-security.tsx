import React from 'react';

import {PinGuard} from '@app/components/pin-guard';
import {SettingsSecurity} from '@app/components/settings-security';
import {useTypedNavigation} from '@app/hooks';

export const SettingsSecurityScreen = () => {
  const navigation = useTypedNavigation();

  const onSubmit = () => {
    navigation.navigate('settingsSecurityPin');
  };

  return (
    <PinGuard>
      <SettingsSecurity onSubmit={onSubmit} />
    </PinGuard>
  );
};
