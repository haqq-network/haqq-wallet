import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {popupScreenOptions} from '@app/helpers';
import {I18N, getText} from '@app/i18n';

import {OnboardingBiometryScreen} from '@app/screens/onboarding-biometry';
import {OnboardingFinishScreen} from '@app/screens/onboarding-finish';
import {OnboardingRepeatPinScreen} from '@app/screens/onboarding-repeat-pin';
import {OnboardingSetupPinScreen} from '@app/screens/onboarding-setup-pin';
import {SignInAgreementScreen} from '@app/screens/signin-agreement';
import {SignInRestoreScreen} from '@app/screens/signin-restore-wallet';
import {SigninStoreWalletScreen} from '@app/screens/signin-store-wallet';

import {ScreenOptionType} from '@app/types';

const SignInStack = createStackNavigator();

const screenOptions: ScreenOptionType = {
  title: '',
  headerBackHidden: true,
};

export const SignInScreen = () => {
  const title = getText(I18N.signInTitle);
  return (
    <SignInStack.Navigator screenOptions={popupScreenOptions}>
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
