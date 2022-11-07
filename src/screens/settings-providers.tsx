import React, {useCallback, useEffect, useState} from 'react';

import {SettingsProviders} from '../components/settings-providers/settings-providers';
import {useUser} from '../hooks/use-user';
import {realm} from '../models';
import {Provider} from '../models/provider';

export const SettingsProvidersScreen = () => {
  const user = useUser();
  const [providers, setProviders] = useState(
    realm.objects<Provider>('Provider').toJSON(),
  );

  useEffect(() => {
    const list = realm.objects<Provider>('Provider');

    const callback = () => {
      setProviders(realm.objects<Provider>('Provider').toJSON());
    };

    list.addListener(callback);

    return () => {
      list.removeListener(callback);
    };
  }, []);

  const onSelectProvider = useCallback(
    (providerId: string) => {
      user.providerId = providerId;
    },
    [user],
  );

  return (
    <SettingsProviders
      providers={providers}
      providerId={user.providerId}
      onSelect={onSelectProvider}
    />
  );
};
