import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SignUpAgreementScreen} from './signup-agreement';
import {OnboardingSetupPinScreen} from './onboarding-setup-pin';
import {PopupHeader} from '../components/popup-header';
import {OnboardingRepeatPinScreen} from './onboarding-repeat-pin';
import {CompositeScreenProps} from '@react-navigation/native';
import {OnboardingBiometryScreen} from './onboarding-biometry';
import {SignupStoreWalletScreen} from './signup-store-wallet';
import {OnboardingFinishScreen} from './onboarding-finish';
import {DismissPopupButton} from '../components/dismiss-popup-button';

const SignUpStack = createNativeStackNavigator();
type SignUpScreenProp = CompositeScreenProps<any, any>;

export const SignUpScreen = ({route}: SignUpScreenProp) => {
  const title = 'Create a wallet';
  return (
    <SignUpStack.Navigator screenOptions={{header: PopupHeader}}>
      <SignUpStack.Screen
        name="signupAgreement"
        component={SignUpAgreementScreen}
        options={{
          headerRight: DismissPopupButton,
          headerBackHidden: true,
        }}
        initialParams={{next: route.params.next}}
      />
      <SignUpStack.Screen
        name="onboarding-setup-pin"
        component={OnboardingSetupPinScreen}
        options={{title}}
      />
      <SignUpStack.Screen
        name="onboarding-repeat-pin"
        component={OnboardingRepeatPinScreen}
        options={{title}}
        initialParams={{nextScreen: 'signupStoreWallet'}}
      />
      <SignUpStack.Screen
        name="onboarding-biometry"
        component={OnboardingBiometryScreen}
        options={{title}}
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
        options={{title: '', headerBackHidden: true}}
      />
    </SignUpStack.Navigator>
  );
};
