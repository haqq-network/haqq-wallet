import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OnboardingSetupPinScreen} from './onboarding-setup-pin';
import {PopupHeader} from '../components/popup-header';
import {OnboardingRepeatPinScreen} from './onboarding-repeat-pin';
import {CompositeScreenProps} from '@react-navigation/native';
import {SignInRestoreScreen} from './signin-restore-wallet';
import {OnboardingBiometryScreen} from './onboarding-biometry';
import {SignInAgreementScreen} from './signin-agreement';
import {OnboardingFinishScreen} from './onboarding-finish';
import {SigninStoreWalletScreen} from './signin-store-wallet';

const SignInStack = createNativeStackNavigator();
type SignInScreenProp = CompositeScreenProps<any, any>;

export const SignInScreen = ({}: SignInScreenProp) => {
  const title = 'Restore wallet';
  return (
    <SignInStack.Navigator
      screenOptions={{
        header: PopupHeader,
      }}>
      <SignInStack.Screen
        name="signinAgreement"
        component={SignInAgreementScreen}
        options={{title}}
        initialParams={{
          nextScreen: 'signinRestoreWallet',
        }}
      />
      <SignInStack.Screen
        name="signinRestoreWallet"
        component={SignInRestoreScreen}
        options={{title}}
        initialParams={{
          nextScreen: 'onboarding-setup-pin',
        }}
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
        initialParams={{nextScreen: 'signinStore'}}
      />
      <SignInStack.Screen
        name="onboarding-biometry"
        component={OnboardingBiometryScreen}
        options={{title}}
        initialParams={{nextScreen: 'signinStore'}}
      />
      <SignInStack.Screen
        name="signinStore"
        component={SigninStoreWalletScreen}
        options={{title: '', headerBackHidden: true}}
        initialParams={{action: 'restore'}}
      />
      <SignInStack.Screen
        name="onboardingFinish"
        component={OnboardingFinishScreen}
        options={{title: '', headerBackHidden: true}}
        initialParams={{action: 'restore'}}
      />
    </SignInStack.Navigator>
  );
};
