import React, {useCallback, useEffect, useState} from 'react';

import {Color} from '@app/colors';
import {SettingsProviders} from '@app/components/settings-providers';
import {CustomHeader} from '@app/components/ui';
import {app} from '@app/contexts';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';

export const SettingsProvidersScreen = () => {
  const navigation = useTypedNavigation();
  const [providers, setProviders] = useState<Realm.Results<Provider>>(
    Provider.getAll().snapshot(),
  );

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

  const onSelectProvider = useCallback(
    (providerId: string) => {
      navigation.navigate('settingsProviderForm', {
        id: providerId,
      });
    },
    [navigation],
  );

  const onPressAdd = useCallback(() => {
    navigation.push('settingsProviderForm', {});
  }, [navigation]);

  return (
    <>
      <CustomHeader
        onPressLeft={navigation.goBack}
        iconLeft="arrow_back"
        title={I18N.settingsProvidersTitle}
        i18nTextRight={I18N.settingsProvidersTitleRight}
        colorRight={Color.textGreen1}
        onPressRight={onPressAdd}
      />
      <SettingsProviders
        providers={providers}
        providerId={app.providerId}
        onSelect={onSelectProvider}
      />
    </>
  );
};
