import React, {memo} from 'react';

import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {popupScreenOptions} from '@app/helpers';
import {WelcomeStackParamList} from '@app/screens/WelcomeStack';
import {LedgerStackRoutes} from '@app/screens/WelcomeStack/LedgerStack';
import {OnboardingBiometryScreen} from '@app/screens/WelcomeStack/OnboardingStack/onboarding-biometry';
import {OnboardingFinishScreen} from '@app/screens/WelcomeStack/OnboardingStack/onboarding-finish';
import {OnboardingRepeatPinScreen} from '@app/screens/WelcomeStack/OnboardingStack/onboarding-repeat-pin';
import {OnboardingSetupPinScreen} from '@app/screens/WelcomeStack/OnboardingStack/onboarding-setup-pin';
import {OnboardingTrackUserActivityScreen} from '@app/screens/WelcomeStack/OnboardingStack/onboarding-track-user-activity';
import {SignInStackRoutes} from '@app/screens/WelcomeStack/SignInStack';
import {SignUpStackRoutes} from '@app/screens/WelcomeStack/SignUpStack';
import {AdjustEvents, BiometryType, WalletInitialData} from '@app/types';

export enum OnboardingStackRoutes {
  OnboardingSetupPin = 'onboardingSetupPin_',
  OnboardingRepeatPin = 'onboardingRepeatPin',
  OnboardingBiometry = 'onboardingBiometry',
  OnboardingTrackUserActivity = 'onboardingTrackUserActivity',
  OnboardingFinish = 'onboardingFinish',
}

type AnyRouteFromParent =
  | SignInStackRoutes
  | SignUpStackRoutes
  | LedgerStackRoutes;

export type OnboardingStackParamList = WelcomeStackParamList & {
  [OnboardingStackRoutes.OnboardingSetupPin]: WalletInitialData & {
    provider?: ProviderMnemonicReactNative;
    currentPin: string;
    nextScreen: AnyRouteFromParent;
    errorText?: string;
  };
  [OnboardingStackRoutes.OnboardingRepeatPin]: WalletInitialData & {
    provider?: ProviderMnemonicReactNative;
    currentPin: string;
    nextScreen: AnyRouteFromParent;
  };
  [OnboardingStackRoutes.OnboardingBiometry]: {
    biometryType: BiometryType;
    nextScreen: AnyRouteFromParent;
  };
  [OnboardingStackRoutes.OnboardingTrackUserActivity]: {
    biometryType: BiometryType;
    nextScreen: AnyRouteFromParent;
  };
  [OnboardingStackRoutes.OnboardingFinish]: {
    nextScreen?: AnyRouteFromParent;
    action: 'create' | 'restore';
    hide?: boolean;
    event: AdjustEvents;
    onboarding?: boolean;
  };
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

type Props = {
  title: string;
  initialParams: {
    [key in OnboardingStackRoutes]:
      | {
          nextScreen?: AnyRouteFromParent;
        }
      | OnboardingStackParamList[OnboardingStackRoutes.OnboardingFinish];
  };
};

const OnboardingStack = memo(({initialParams, title}: Props) => {
  const screenOptionsWithoutTitle = {
    title: '',
    headerBackHidden: true,
  };
  const screenOptionsWithTitle = {
    title,
    headerBackHidden: true,
  };
  const screenOptionsTitleOnly: NativeStackNavigationOptions = {
    title,
  };

  return (
    <Stack.Navigator screenOptions={popupScreenOptions}>
      <Stack.Screen
        name={OnboardingStackRoutes.OnboardingSetupPin}
        component={OnboardingSetupPinScreen}
        options={screenOptionsTitleOnly}
        initialParams={initialParams[OnboardingStackRoutes.OnboardingSetupPin]}
      />
      <Stack.Screen
        name={OnboardingStackRoutes.OnboardingRepeatPin}
        component={OnboardingRepeatPinScreen}
        options={screenOptionsTitleOnly}
        initialParams={initialParams[OnboardingStackRoutes.OnboardingRepeatPin]}
      />
      <Stack.Screen
        name={OnboardingStackRoutes.OnboardingBiometry}
        component={OnboardingBiometryScreen}
        options={screenOptionsWithTitle}
        initialParams={initialParams[OnboardingStackRoutes.OnboardingBiometry]}
      />
      <Stack.Screen
        name={OnboardingStackRoutes.OnboardingTrackUserActivity}
        component={OnboardingTrackUserActivityScreen}
        options={screenOptionsWithTitle}
        initialParams={
          initialParams[OnboardingStackRoutes.OnboardingTrackUserActivity]
        }
      />
      {Object.keys(initialParams[OnboardingStackRoutes.OnboardingFinish])
        .length > 0 && (
        <Stack.Screen
          name={OnboardingStackRoutes.OnboardingFinish}
          component={OnboardingFinishScreen}
          initialParams={initialParams[OnboardingStackRoutes.OnboardingFinish]}
          options={{...screenOptionsWithoutTitle, animation: 'fade'}}
        />
      )}
    </Stack.Navigator>
  );
});

export {OnboardingStack};
