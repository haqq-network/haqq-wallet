import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';

import {Color} from '@app/colors';
import {SettingsProviders} from '@app/components/settings-providers';
import {CustomHeader} from '@app/components/ui';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {
  ProvidersStackParamList,
  ProvidersStackRoutes,
} from '@app/screens/HomeStack/ProvidersStack';

export const SettingsProvidersScreen = memo(() => {
  const navigation = useTypedNavigation<ProvidersStackParamList>();
  const [providers, setProviders] = useState<Realm.Results<Provider>>(
    Provider.getAll().snapshot(),
  );

  const [providerId, setProviderId] = useState(app.providerId);

  useEffect(() => {
    const list = Provider.getAll();

    const callback = () => {
      setProviders(Provider.getAll().snapshot());
    };

    list.addListener(callback);

    return () => {
      list.removeListener(callback);
    };
  }, []);

  useEffect(() => {
    const callback = () => {
      setProviderId(app.providerId);
    };

    app.on(Events.onProviderChanged, callback);

    return () => {
      app.off(Events.onProviderChanged, callback);
    };
  }, []);

  const onSelectProvider = useCallback(
    (pid: string) => {
      navigation.navigate(ProvidersStackRoutes.SettingsProviderForm, {
        id: pid,
      });
    },
    [navigation],
  );

  const onPressAdd = useCallback(() => {
    navigation.push(ProvidersStackRoutes.SettingsProviderForm, {});
  }, [navigation]);

  const header = useMemo(() => {
    if (app.isDeveloper) {
      return (
        <CustomHeader
          onPressLeft={navigation.goBack}
          iconLeft="arrow_back"
          title={I18N.settingsProvidersTitle}
          i18nTextRight={I18N.settingsProvidersTitleRight}
          colorRight={Color.textGreen1}
          onPressRight={onPressAdd}
        />
      );
    }

    return (
      <CustomHeader
        onPressLeft={navigation.goBack}
        iconLeft="arrow_back"
        title={I18N.settingsProvidersTitle}
      />
    );
  }, [navigation.goBack, onPressAdd]);

  return (
    <>
      {header}
      <SettingsProviders
        providers={providers}
        providerId={providerId}
        onSelect={onSelectProvider}
      />
    </>
  );
});
