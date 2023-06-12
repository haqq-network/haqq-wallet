import React, {useEffect} from 'react';

import {HomeSettings} from '@app/components/home-settings';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {AdjustEvents} from '@app/types';

export const HomeSettingsScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'homeSettings'>();

  useEffect(() => {
    onTrackEvent(AdjustEvents.settingsOpen);
  }, []);

  useEffect(() => {
    if (route?.params?.screen) {
      navigation.navigate(route.params.screen, route.params.params);
    }
  }, [navigation, route]);

  return <HomeSettings />;
};
