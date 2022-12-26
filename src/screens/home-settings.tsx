import React, {useEffect} from 'react';

import {HomeSettings} from '@app/components/home-settings';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const HomeSettingsScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'homeSettings'>();

  useEffect(() => {
    if (route?.params?.screen) {
      navigation.navigate(route.params.screen, route.params.params);
    }
  }, [navigation, route]);

  return <HomeSettings />;
};
