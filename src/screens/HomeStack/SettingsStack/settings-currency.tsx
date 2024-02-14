import React, {memo} from 'react';

import {SettingsCurrency} from '@app/components/settings/settings-currency';
import {useTypedNavigation} from '@app/hooks';

export const SettingsCurrencyScreen = memo(() => {
  const navigation = useTypedNavigation();

  return <SettingsCurrency goBack={navigation.goBack} />;
});
