import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OnboardingSetupPinScreen} from './onboarding-setup-pin';
import {PopupHeader} from '../components/popup-header';
import {OnboardingRepeatPinScreen} from './onboarding-repeat-pin';
import {CompositeScreenProps} from '@react-navigation/native';
import {SignInRestoreScreen} from './signin-restore-wallet';
import {OnboardingBiometryScreen} from './onboarding-biometry';
import {SignInAgreementScreen} from './signin-agreement';
import {OnboardingStoreWalletScreen} from './onboarding-store-wallet';
import {OnboardingFinishScreen} from './onboarding-finish';

const SignInStack = createNativeStackNavigator();
type SignInScreenProp = CompositeScreenProps<any, any>;

export const SignInScreen = ({route}: SignInScreenProp) => {
  const title = 'Restore wallet';
  return (
    <SignInStack.Navigator
      screenOptions={{
        header: PopupHeader,
      }}>
      <SignInStack.Screen
        name="signin-restore-intro"
        component={SignInAgreementScreen}
        options={{title}}
        initialParams={{next: route.params.next}}
      />
      <SignInStack.Screen
        name="signin-restore-wallet"
        component={SignInRestoreScreen}
        options={{title}}
      />
      <SignInStack.Screen
        name="onboarding-setup-pin"
        component={OnboardingSetupPinScreen}
        options={{title}}
      />
      <SignInStack.Screen
        name="onboarding-repeat-pin"
        component={OnboardingRepeatPinScreen}
        options={{title}}
      />
      <SignInStack.Screen
        name="onboarding-biometry"
        component={OnboardingBiometryScreen}
        options={{title}}
      />
      <SignInStack.Screen
        name="onboarding-store-wallet"
        component={OnboardingStoreWalletScreen}
        options={{
          title,
          header: () => null,
        }}
        initialParams={{action: 'restore'}}
      />
      <SignInStack.Screen
        name="onboarding-finish"
        component={OnboardingFinishScreen}
        options={{title}}
        initialParams={{action: 'restore'}}
      />
    </SignInStack.Navigator>
  );
};
