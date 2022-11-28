import React, {useCallback, useMemo} from 'react';

import {SettingsProviderEdit} from '@app/components/settings-provider-edit';
import {useTypedNavigation, useTypedRoute, useUser} from '@app/hooks';
import {Provider} from '@app/models/provider';

export const SettingsProviderEditScreen = () => {
  const user = useUser();
  const {goBack} = useTypedNavigation();
  const route = useTypedRoute<'settingsProviderForm'>();
  const provider = useMemo(
    () => (route.params?.id ? Provider.getProvider(route.params?.id) : null),
    [route.params?.id],
  );

  const onSubmit = useCallback(
    (data: Partial<Provider>) => {
      if (provider) {
        provider.update(data);
      } else {
        Provider.create(data);
      }
      goBack();
    },
    [goBack, provider],
  );

  const onDelete = useCallback(() => {
    if (provider?.id) {
      Provider.remove(provider.id);
    }
    goBack();
  }, [goBack, provider?.id]);

  const onSelect = useCallback(() => {
    if (provider) {
      user.providerId = provider.id;
    }
    goBack();
  }, [goBack, provider, user]);

  return (
    <>
      <SettingsProviderEdit
        provider={provider}
        onSubmit={onSubmit}
        onDelete={onDelete}
        onSelect={onSelect}
        onCancel={goBack}
      />
    </>
  );
};
