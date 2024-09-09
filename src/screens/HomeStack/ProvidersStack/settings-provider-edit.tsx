import React, {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';
import {Alert} from 'react-native';

import {SettingsProviderEdit} from '@app/components/settings/settings-providers/settings-provider-edit';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Provider, ProviderModel} from '@app/models/provider';
import {ProvidersStackParamList, ProvidersStackRoutes} from '@app/route-types';

export const SettingsProviderEditScreen = observer(() => {
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
      Provider.setSelectedProviderId(provider.id);
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
