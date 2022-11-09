import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList, ScreenOptionType} from '../types';
import {hideBack, popupScreenOptions} from '../helpers/screenOptions';
import {SignUpAgreementScreen} from './signup-agreement';
import {OnboardingSetupPinScreen} from './onboarding-setup-pin';
import {OnboardingRepeatPinScreen} from './onboarding-repeat-pin';
import {OnboardingBiometryScreen} from './onboarding-biometry';
import {SignupStoreWalletScreen} from './signup-store-wallet';
import {OnboardingFinishScreen} from './onboarding-finish';

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
