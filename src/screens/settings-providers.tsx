import React, {useCallback, useEffect, useState} from 'react';

import {Color} from '@app/colors';
import {SettingsProviders} from '@app/components/settings-providers/settings-providers';
import {CustomHeader} from '@app/components/ui';
import {useTypedNavigation, useUser} from '@app/hooks';
import {I18N} from '@app/i18n';
import {realm} from '@app/models';
import {Provider} from '@app/models/provider';

export const SettingsProvidersScreen = () => {
  const navigation = useTypedNavigation();
  const user = useUser();
  const [providers, setProviders] = useState<Realm.Results<Provider>>(
    realm.objects<Provider>('Provider'),
  );

  useEffect(() => {
    const list = realm.objects<Provider>('Provider');

    const callback = () => {
      setProviders(realm.objects<Provider>('Provider'));
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
        i18nTitle={I18N.settingsProvidersTitle}
        i18nTextRight={I18N.settingsProvidersTitleRight}
        colorRight={Color.textGreen1}
        onPressRight={onPressAdd}
      />
      <SettingsProviders
        providers={providers}
        providerId={user.providerId}
        onSelect={onSelectProvider}
      />
    </>
  );
};
