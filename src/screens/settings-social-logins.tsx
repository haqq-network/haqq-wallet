import React, {useEffect} from 'react';

import {SettingsSocialLogins} from '@app/components/settings-social-logins';
import {useTypedRoute} from '@app/hooks';

export const SettingsSocialLoginsScreen = () => {
  const {accountId} = useTypedRoute<'settingsSocialLogins'>().params;

  useEffect(() => {
    console.log('settingsSocialLogins', accountId);
  }, [accountId]);

  return <SettingsSocialLogins />;
};
