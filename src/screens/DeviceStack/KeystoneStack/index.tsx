import React, {memo, useCallback} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, hideHeader, popupScreenOptions} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {
  WelcomeStackParamList,
  WelcomeStackRoutes,
} from '@app/screens/WelcomeStack';
import {
  OnboardingStack,
  OnboardingStackRoutes,
} from '@app/screens/WelcomeStack/OnboardingStack';
import {KeystoneWalletInitialData, ScreenOptionType} from '@app/types';

import {KeystoneAccountsScreen} from './keystone-accounts';
import {KeystoneCameraPermissionScreen} from './keystone-camera-permission';
import {KeystoneConnectionStepsScreen} from './keystone-connection-steps';
import {KeystoneFinishScreen} from './keystone-finish';
import {KeystoneStoreWalletScreen} from './keystone-store-wallet';

export enum KeystoneStackRoutes {
  KeystoneAccounts = 'KeystoneAccounts',
  KeystoneConnectionSteps = 'KeystoneConnectionSteps',
  KeystoneStoreWallet = 'KeystoneStoreWallet',
  KeystoneFinish = 'KeystoneFinish',
  KeystoneCameraPermission = 'KeystoneCameraPermission',
  OnboardingSetupPin = 'OnboardingSetupPin',
}

export type KeystoneStackParamList = WelcomeStackParamList & {
  [KeystoneStackRoutes.KeystoneConnectionSteps]: WelcomeStackParamList[WelcomeStackRoutes.Device];
  [KeystoneStackRoutes.KeystoneCameraPermission]: undefined;
  [KeystoneStackRoutes.KeystoneAccounts]: {
    cryptoHDKeyCBORHex: string;
  };
  [KeystoneStackRoutes.KeystoneStoreWallet]: KeystoneWalletInitialData;
  [KeystoneStackRoutes.KeystoneFinish]: undefined;
  [KeystoneStackRoutes.OnboardingSetupPin]: undefined;
};

const Stack = createNativeStackNavigator<KeystoneStackParamList>();
const title = getText(I18N.keystoneConnect);

const screenOptionsBiometry: ScreenOptionType = {title, headerBackHidden: true};

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
    <Stack.Navigator screenOptions={popupScreenOptions}>
      <Stack.Screen
        name={KeystoneStackRoutes.KeystoneConnectionSteps}
        component={KeystoneConnectionStepsScreen}
        options={hideBack}
      />
      <Stack.Screen
        name={KeystoneStackRoutes.KeystoneCameraPermission}
        component={KeystoneCameraPermissionScreen}
        options={hideBack}
      />
      <Stack.Screen
        name={KeystoneStackRoutes.KeystoneAccounts}
        component={KeystoneAccountsScreen}
        options={hideBack}
      />
      <Stack.Screen
        name={KeystoneStackRoutes.KeystoneStoreWallet}
        component={KeystoneStoreWalletScreen}
        options={screenOptionsBiometry}
      />
      <Stack.Screen
        name={KeystoneStackRoutes.KeystoneFinish}
        component={KeystoneFinishScreen}
        options={hideBack}
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
