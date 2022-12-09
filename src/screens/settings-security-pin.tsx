import React from 'react';

import {SettingsSecurityPin} from '@app/components/settings-security-pin';
import {useTypedNavigation} from '@app/hooks';

export const SettingsSecurityPinScreen = () => {
  const {goBack} = useTypedNavigation();

  return <SettingsSecurityPin goBack={goBack} />;
};
