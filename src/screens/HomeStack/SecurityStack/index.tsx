import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {SecurityStackParamList, SecurityStackRoutes} from '@app/route-types';
import {basicScreenOptions} from '@app/screens';
import {SettingsSecurityScreen} from '@app/screens/HomeStack/SecurityStack/settings-security';
import {SettingsSecurityPinScreen} from '@app/screens/HomeStack/SecurityStack/settings-security-pin';

const Stack = createNativeStackNavigator<SecurityStackParamList>();

const noHeaderOptions = {headerShown: false};

const SecurityStack = memo(() => {
  return (
    <Stack.Navigator
      initialRouteName={SecurityStackRoutes.SettingsSecurity}
      screenOptions={basicScreenOptions}>
      <Stack.Screen
        name={SecurityStackRoutes.SettingsSecurity}
        component={SettingsSecurityScreen}
        options={noHeaderOptions}
      />
      <Stack.Screen
        name={SecurityStackRoutes.SettingsSecurityPin}
        component={SettingsSecurityPinScreen}
        options={noHeaderOptions}
      />
    </Stack.Navigator>
  );
});

export {SecurityStack};
