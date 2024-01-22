import React, {memo, useCallback} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, hideHeader, popupScreenOptions} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {
  KeystoneStackParamList,
  KeystoneStackRoutes,
  OnboardingStackRoutes,
} from '@app/route-types';
import {KeystoneAccountsScreen} from '@app/screens/DeviceStack/KeystoneStack/keystone-accounts';
import {KeystoneCameraPermissionScreen} from '@app/screens/DeviceStack/KeystoneStack/keystone-camera-permission';
import {KeystoneConnectionStepsScreen} from '@app/screens/DeviceStack/KeystoneStack/keystone-connection-steps';
import {KeystoneFinishScreen} from '@app/screens/DeviceStack/KeystoneStack/keystone-finish';
import {OnboardingStack} from '@app/screens/WelcomeStack/OnboardingStack';

const Stack = createNativeStackNavigator<KeystoneStackParamList>();
const title = getText(I18N.keystoneConnect);

const KeystoneStack = memo(() => {
  const OnboardingStackGenerated = useCallback(
    //@ts-ignore
    props => (
      <OnboardingStack
        initialParams={{
          [OnboardingStackRoutes.OnboardingSetupPin]: {...props.route.params},
          [OnboardingStackRoutes.OnboardingRepeatPin]: {
            nextScreen: KeystoneStackRoutes.KeystoneFinish,
          },
          [OnboardingStackRoutes.OnboardingBiometry]: {
            nextScreen: KeystoneStackRoutes.KeystoneFinish,
          },
          [OnboardingStackRoutes.OnboardingTrackUserActivity]: {
            nextScreen: KeystoneStackRoutes.KeystoneFinish,
          },
          [OnboardingStackRoutes.OnboardingFinish]: {},
        }}
        title={title}
      />
    ),
    [],
  );

  return (
    <Stack.Navigator screenOptions={{...popupScreenOptions, ...hideBack}}>
      <Stack.Screen
        name={KeystoneStackRoutes.KeystoneConnectionSteps}
        component={KeystoneConnectionStepsScreen}
      />
      <Stack.Screen
        name={KeystoneStackRoutes.KeystoneCameraPermission}
        component={KeystoneCameraPermissionScreen}
      />
      <Stack.Screen
        name={KeystoneStackRoutes.KeystoneAccounts}
        component={KeystoneAccountsScreen}
      />
      <Stack.Screen
        name={KeystoneStackRoutes.KeystoneFinish}
        component={KeystoneFinishScreen}
      />
      <Stack.Screen
        name={KeystoneStackRoutes.OnboardingSetupPin}
        component={OnboardingStackGenerated}
        options={hideHeader}
      />
    </Stack.Navigator>
  );
});

export {KeystoneStack};
