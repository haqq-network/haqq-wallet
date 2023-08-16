import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {Provider} from '@app/models/provider';
import {basicScreenOptions} from '@app/screens';
import {SettingsProviderEditScreen} from '@app/screens/HomeStack/ProvidersStack/settings-provider-edit';
import {SettingsProvidersScreen} from '@app/screens/HomeStack/ProvidersStack/settings-providers';

export enum ProvidersStackRoutes {
  SettingsProviders = 'settingsProviders_',
  SettingsProviderForm = 'settingsProviderForm',
}

export type ProvidersStackParamList = {
  [ProvidersStackRoutes.SettingsProviders]: undefined;
  [ProvidersStackRoutes.SettingsProviderForm]: {
    id?: string;
    data?: Partial<Provider>;
  };
};

const Stack = createNativeStackNavigator<ProvidersStackParamList>();

const ProvidersStack = memo(() => {
  return (
    <Stack.Navigator
      initialRouteName={ProvidersStackRoutes.SettingsProviders}
      screenOptions={basicScreenOptions}>
      <Stack.Screen
        name={ProvidersStackRoutes.SettingsProviders}
        component={SettingsProvidersScreen}
      />
      <Stack.Screen
        name={ProvidersStackRoutes.SettingsProviderForm}
        component={SettingsProviderEditScreen}
      />
    </Stack.Navigator>
  );
});

export {ProvidersStack};
