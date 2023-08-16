import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {popupScreenOptions} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
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

const SecurityStack = memo(() => {
  return (
    <Stack.Navigator
      initialRouteName={SecurityStackRoutes.SettingsSecurity}
      screenOptions={basicScreenOptions}>
      <Stack.Screen
        name={SecurityStackRoutes.SettingsSecurity}
        component={SettingsSecurityScreen}
        options={{
          ...popupScreenOptions,
          headerStyle: {marginTop: 20},
          title: getText(I18N.settingsSecurity),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name={SecurityStackRoutes.SettingsSecurityPin}
        component={SettingsSecurityPinScreen}
        options={{
          ...popupScreenOptions,
          headerStyle: {marginTop: 20},
          title: 'Change PIN',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
});

export {SecurityStack};
