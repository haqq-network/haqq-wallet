import React from 'react';

import {SettingsSecurity} from '@app/components/settings-security';
import {useTypedNavigation} from '@app/hooks';

export const SettingsSecurityScreen = () => {
  const navigation = useTypedNavigation();

  const onSubmit = () => {
    navigation.navigate('settingsSecurityPin');
  };

  return <SettingsSecurity onSubmit={onSubmit} />;
};
