import React, {useCallback, useMemo} from 'react';

import {SettingsProviderEdit} from '@app/components/settings-provider-edit';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Provider} from '@app/models/provider';

export const SettingsProviderEditScreen = () => {
  const {goBack, setParams} = useTypedNavigation();
  const route = useTypedRoute<'settingsProviderForm'>();
  const provider = useMemo(
    () => (route.params?.id ? Provider.getById(route.params?.id) : null),
    [route.params?.id],
  );

  const onSubmit = useCallback(
    (data: Partial<Provider>) => {
      if (provider) {
        provider.update(data);
      } else {
        let id = Provider.create(data);
        setParams({
          id,
        });
      }
    },
    [provider, setParams],
  );

  const onDelete = useCallback(() => {
    if (provider?.id) {
      Provider.remove(provider.id);
    }
    goBack();
  }, [goBack, provider?.id]);

  const onSelect = useCallback(() => {
    if (provider) {
      app.providerId = provider.id;
    }
    goBack();
  }, [goBack, provider]);

  const providerData = useMemo(() => {
    if (provider) {
      return provider.toJSON();
    }

    if (route.params.data) {
      return {...route.params.data, isChanged: true};
    }

    return null;
  }, [provider, route.params.data]);

  return (
    <>
      <SettingsProviderEdit
        provider={providerData}
        onSubmit={onSubmit}
        onDelete={onDelete}
        onSelect={onSelect}
        onCancel={goBack}
      />
    </>
  );
};
