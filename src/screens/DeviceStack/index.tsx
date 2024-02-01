import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, hideHeader, popupScreenOptions} from '@app/helpers';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {DeviceStackParamList, DeviceStackRoutes} from '@app/route-types';
import {DeviceSelectScreen} from '@app/screens/DeviceStack/device-select';
import {KeystoneStack} from '@app/screens/DeviceStack/KeystoneStack';
import {LedgerStack} from '@app/screens/DeviceStack/LedgerStack';

const Stack = createNativeStackNavigator<DeviceStackParamList>();

const DeviceStack = memo(() => {
  return (
    <Stack.Navigator
      screenOptions={popupScreenOptions}
      initialRouteName={DeviceStackRoutes.DeviceSelect}>
      <Stack.Screen
        name={DeviceStackRoutes.DeviceSelect}
        component={themeUpdaterHOC(DeviceSelectScreen)}
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
