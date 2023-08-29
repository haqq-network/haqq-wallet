import React, {memo, useEffect, useState} from 'react';

import {HomeSettings} from '@app/components/home-settings';
import {app} from '@app/contexts';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {Events} from '@app/events';
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
  const [theme, setTheme] = useState(app.theme);

  useEffect(() => {
    onTrackEvent(AdjustEvents.settingsOpen);
  }, []);

  useEffect(() => {
    app.on(Events.onThemeChanged, setTheme);
    if (route?.params?.screen) {
      //@ts-ignore
      navigation.navigate(route.params.screen, route.params.params);
    }

    return () => {
      app.off(Events.onThemeChanged, setTheme);
    };
  }, [navigation, route]);

  return <HomeSettings theme={theme} />;
});
