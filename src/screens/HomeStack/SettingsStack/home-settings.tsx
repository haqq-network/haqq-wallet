import React, {memo, useEffect} from 'react';

import {HomeSettings} from '@app/components/home-settings';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {SettingsStackParamList, SettingsStackRoutes} from '@app/route-types';
import {EventTracker} from '@app/services/event-tracker';
import {MarketingEvents} from '@app/types';

export const HomeSettingsScreen = memo(() => {
  const navigation = useTypedNavigation<SettingsStackParamList>();
  const route = useTypedRoute<
    SettingsStackParamList,
    SettingsStackRoutes.Home
  >();
  useEffect(() => {
    EventTracker.instance.trackEvent(MarketingEvents.settingsOpen);
  }, []);

  useEffect(() => {
    if (route?.params?.screen) {
      //@ts-ignore
      navigation.navigate(route.params.screen, route.params.params);
    }
  }, [app.theme, navigation, route]);

  return <HomeSettings />;
});
