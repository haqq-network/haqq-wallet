import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {ProvidersStackParamList, ProvidersStackRoutes} from '@app/route-types';
import {basicScreenOptions} from '@app/screens';
import {SettingsProviderEditScreen} from '@app/screens/HomeStack/ProvidersStack/settings-provider-edit';
import {SettingsProvidersScreen} from '@app/screens/HomeStack/ProvidersStack/settings-providers';

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
