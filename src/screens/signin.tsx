import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {OnboardingSetupPinScreen} from './onboarding-setup-pin';
import {PopupHeader} from '../components/popup-header';
import {OnboardingRepeatPinScreen} from './onboarding-repeat-pin';
import {SignInRestoreScreen} from './signin-restore-wallet';
import {OnboardingBiometryScreen} from './onboarding-biometry';
import {SignInAgreementScreen} from './signin-agreement';
import {OnboardingFinishScreen} from './onboarding-finish';
import {SigninStoreWalletScreen} from './signin-store-wallet';
import {ScreenOptionType} from '../types';

const SignInStack = createStackNavigator();

const screenOptions: ScreenOptionType = {title: '', headerBackHidden: true};

export const SignInScreen = () => {
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
          nextScreen: 'onboardingSetupPin',
        }}
      />
      <SignInStack.Screen
        name="onboardingSetupPin"
        component={OnboardingSetupPinScreen}
        options={{title}}
      />
      <SignInStack.Screen
        name="onboardingRepeatPin"
        component={OnboardingRepeatPinScreen}
        options={{title}}
        initialParams={{nextScreen: 'signinStoreWallet'}}
      />
      <SignInStack.Screen
        name="onboardingBiometry"
        component={OnboardingBiometryScreen}
        options={screenOptions}
        initialParams={{nextScreen: 'signinStoreWallet'}}
      />
      <SignInStack.Screen
        name="signinStoreWallet"
        component={SigninStoreWalletScreen}
        options={screenOptions}
        initialParams={{action: 'restore'}}
      />
      <SignInStack.Screen
        name="onboardingFinish"
        component={OnboardingFinishScreen}
        options={screenOptions}
        initialParams={{action: 'restore'}}
      />
    </SignInStack.Navigator>
  );
};
