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
import {createStackNavigator} from '@react-navigation/stack';

const SignInStack = createStackNavigator();
type RestoreScreenProp = CompositeScreenProps<any, any>;

export const RestoreScreen = ({}: RestoreScreenProp) => {
  const title = 'Restore wallet';
  return (
    <SignInStack.Navigator
      screenOptions={{
        header: PopupHeader,
      }}>
      <SignInStack.Screen
        name="restoreAgreement"
        component={SignInAgreementScreen}
        options={{title}}
        initialParams={{nextScreen: 'restorePhrase'}}
      />
      <SignInStack.Screen
        name="restorePhrase"
        component={SignInRestoreScreen}
        options={{title}}
        initialParams={{nextScreen: 'restoreStoreWallet'}}
      />
      <SignInStack.Screen
        name="restoreStoreWallet"
        component={OnboardingStoreWalletScreen}
        options={{
          title,
          header: () => null,
        }}
        initialParams={{action: 'restore', nextScreen: 'restoreFinish'}}
      />
      <SignInStack.Screen
        name="restoreFinish"
        component={OnboardingFinishScreen}
        options={{title}}
        initialParams={{action: 'restore'}}
      />
    </SignInStack.Navigator>
  );
};
