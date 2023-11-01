import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {basicScreenOptions} from '@app/screens';
import {HomeStackParamList} from '@app/screens/HomeStack';
import {SettingsSecurityScreen} from '@app/screens/HomeStack/SecurityStack/settings-security';
import {SettingsSecurityPinScreen} from '@app/screens/HomeStack/SecurityStack/settings-security-pin';
import {SettingsStackParamList} from '@app/screens/HomeStack/SettingsStack';

export enum SecurityStackRoutes {
  SettingsSecurity = 'settingsSecurity_',
  SettingsSecurityPin = 'settingsSecurityPin',
}

export type SecurityStackParamList = HomeStackParamList &
  SettingsStackParamList & {
    [SecurityStackRoutes.SettingsSecurity]: undefined;
    [SecurityStackRoutes.SettingsSecurityPin]: undefined;
  };

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
