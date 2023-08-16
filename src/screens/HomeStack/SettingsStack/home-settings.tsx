import React, {memo, useEffect} from 'react';

import {HomeSettings} from '@app/components/home-settings';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  SettingsStackParamList,
  SettingsStackRoutes,
} from '@app/screens/HomeStack/SettingsStack';
import {AdjustEvents} from '@app/types';

export const HomeSettingsScreen = memo(() => {
  const navigation = useTypedNavigation<SettingsStackParamList>();
  const route = useTypedRoute<
    SettingsStackParamList,
    SettingsStackRoutes.Home
  >();

  useEffect(() => {
    onTrackEvent(AdjustEvents.settingsOpen);
  }, []);

  useEffect(() => {
    if (route?.params?.screen) {
      //@ts-ignore
      navigation.navigate(route.params.screen, route.params?.params);
    }
  }, [navigation, route]);

  return <HomeSettings />;
});
