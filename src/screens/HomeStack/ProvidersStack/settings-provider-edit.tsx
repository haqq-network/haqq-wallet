import React, {memo, useCallback, useMemo} from 'react';

import {Alert} from 'react-native';

import {SettingsProviderEdit} from '@app/components/settings/settings-providers/settings-provider-edit';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Provider, ProviderModel} from '@app/models/provider';
import {ProvidersStackParamList, ProvidersStackRoutes} from '@app/route-types';

export const SettingsProviderEditScreen = memo(() => {
  const {goBack, setParams} = useTypedNavigation<ProvidersStackParamList>();
  const route = useTypedRoute<
    ProvidersStackParamList,
    ProvidersStackRoutes.SettingsProviderForm
  >();
  const provider = useMemo(
    () => (route.params?.id ? Provider.getById(route.params?.id) : null),
    [route.params?.id],
  );

  const onSubmit = useCallback(
    (_: Partial<ProviderModel>) => {
      // TODO:
      Alert.alert(
        'This feature for developer',
        'Edit providers not yet implemented',
      );
      // if (provider) {
      //   provider.update(data);
      // } else {
      //   let id = Provider.create(data);
      //   setParams({
      //     id,
      //   });
      // }
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

    if (route?.params.data) {
      return {...route.params.data, isChanged: true};
    }

    return null;
  }, [provider, route?.params.data]);

  return (
    <SettingsProviderEdit
      provider={providerData}
      onSubmit={onSubmit}
      onDelete={onDelete}
      onSelect={onSelect}
      onCancel={goBack}
    />
  );
});
