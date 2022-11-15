import React from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {hideBack, popupScreenOptions} from '@app/helpers';

import {OnboardingBiometryScreen} from './onboarding-biometry';
import {OnboardingFinishScreen} from './onboarding-finish';
import {OnboardingRepeatPinScreen} from './onboarding-repeat-pin';
import {OnboardingSetupPinScreen} from './onboarding-setup-pin';
import {SignUpAgreementScreen} from './signup-agreement';
import {SignupStoreWalletScreen} from './signup-store-wallet';

import {RootStackParamList, ScreenOptionType} from '../types';

const SignUpStack = createStackNavigator();

const screenOptions: ScreenOptionType = {title: '', headerBackHidden: true};

const title = 'Create a wallet';

const screenOptionsBiometry: ScreenOptionType = {title, headerBackHidden: true};

export const SignUpScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'signup'>>();
  return (
    <SignUpStack.Navigator screenOptions={popupScreenOptions}>
      <SignUpStack.Screen
        name="signupAgreement"
        component={SignUpAgreementScreen}
        options={hideBack}
        initialParams={{next: route.params.next}}
      />
      <SignUpStack.Screen
        name="onboardingSetupPin"
        component={OnboardingSetupPinScreen}
        options={{title}}
      />
      <SignUpStack.Screen
        name="onboardingRepeatPin"
        component={OnboardingRepeatPinScreen}
        options={{title}}
        initialParams={{nextScreen: 'signupStoreWallet'}}
      />
      <SignUpStack.Screen
        name="onboardingBiometry"
        component={OnboardingBiometryScreen}
        options={screenOptionsBiometry}
        initialParams={{nextScreen: 'signupStoreWallet'}}
      />
      <SignUpStack.Screen
        name="signupStoreWallet"
        component={SignupStoreWalletScreen}
        options={{
          title,
          header: () => null,
        }}
        initialParams={{action: 'create'}}
      />
      <SignUpStack.Screen
        name="onboardingFinish"
        component={OnboardingFinishScreen}
        initialParams={{action: 'create'}}
        options={screenOptions}
      />
    </SignUpStack.Navigator>
  );
};
