import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SignUpAgreementScreen } from './signup-agreement';
import { OnboardingSetupPinScreen } from './onboarding-setup-pin';
import { PopupHeader } from '../components/popup-header';
import { OnboardingRepeatPinScreen } from './onboarding-repeat-pin';
import { CompositeScreenProps } from '@react-navigation/native';
import { OnboardingBiometryScreen } from './onboarding-biometry';
import { OnboardingStoreWalletScreen } from './onboarding-store-wallet';
import { OnboardingFinishScreen } from './onboarding-finish';

const SignUpStack = createNativeStackNavigator();
type SignUpScreenProp = CompositeScreenProps<any, any>;

export const SignUpScreen = ({ route }: SignUpScreenProp) => {
  const title = 'Create a wallet';
  return (
    <SignUpStack.Navigator screenOptions={{ header: PopupHeader }}>
      <SignUpStack.Screen
        name="signin-agreement"
        component={SignUpAgreementScreen}
        initialParams={{ next: route.params.next }}
      />
      <SignUpStack.Screen
        name="onboarding-setup-pin"
        component={OnboardingSetupPinScreen}
        options={{ title }}
      />
      <SignUpStack.Screen
        name="onboarding-repeat-pin"
        component={OnboardingRepeatPinScreen}
        options={{ title }}
      />
      <SignUpStack.Screen
        name="onboarding-biometry"
        component={OnboardingBiometryScreen}
        options={{ title }}
      />
      <SignUpStack.Screen
        name="onboarding-store-wallet"
        component={OnboardingStoreWalletScreen}
        options={{ title }}
      />
      <SignUpStack.Screen
        name="onboarding-finish"
        component={OnboardingFinishScreen}
        options={{ title }}
        initialParams={{ action: 'create' }}
      />
    </SignUpStack.Navigator>
  );
};
