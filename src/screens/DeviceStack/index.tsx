import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, hideHeader, popupScreenOptions} from '@app/helpers';

import {DeviceSelectScreen} from './device-select';
import {KeystoneStack} from './KeystoneStack';
import {LedgerStack} from './LedgerStack';

export enum DeviceStackRoutes {
  DeviceSelect = 'DeviceSelect',
  DeviceKeystone = 'DeviceKeystone',
  DeviceLedger = 'DeviceLedger',
}

export type DeviceStackParamList = {
  DeviceSelect: undefined;
  DeviceKeystone: undefined;
  DeviceLedger: undefined;
};

const Stack = createNativeStackNavigator<DeviceStackParamList>();

const DeviceStack = memo(() => {
  return (
    <Stack.Navigator
      screenOptions={popupScreenOptions}
      initialRouteName={DeviceStackRoutes.DeviceSelect}>
      <Stack.Screen
        name={DeviceStackRoutes.DeviceSelect}
        component={DeviceSelectScreen}
        options={hideBack}
      />
      <Stack.Screen
        name={DeviceStackRoutes.DeviceKeystone}
        component={KeystoneStack}
        options={hideHeader}
      />
      <Stack.Screen
        name={DeviceStackRoutes.DeviceLedger}
        component={LedgerStack}
        options={hideHeader}
      />
    </Stack.Navigator>
  );
});

export {DeviceStack};
