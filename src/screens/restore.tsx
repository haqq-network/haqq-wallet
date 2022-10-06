import React from 'react';
import {PopupHeader} from '../components/popup-header';
import {CompositeScreenProps} from '@react-navigation/native';
import {SignInRestoreScreen} from './signin-restore-wallet';
import {SignInAgreementScreen} from './signin-agreement';
import {OnboardingFinishScreen} from './onboarding-finish';
import {createStackNavigator} from '@react-navigation/stack';
import {DismissPopupButton} from '../components/dismiss-popup-button';
import {SigninStoreWalletScreen} from './signin-store-wallet';

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
        options={{
          title,
          headerBackHidden: true,
          headerRight: DismissPopupButton,
        }}
        initialParams={{nextScreen: 'restorePhrase'}}
      />
      <SignInStack.Screen
        name="restorePhrase"
        component={SignInRestoreScreen}
        options={{title}}
        initialParams={{nextScreen: 'restoreStore'}}
      />
      <SignInStack.Screen
        name="restoreStore"
        component={SigninStoreWalletScreen}
        options={{title: '', headerBackHidden: true}}
        initialParams={{nextScreen: 'restoreFinish'}}
      />
      <SignInStack.Screen
        name="restoreFinish"
        component={OnboardingFinishScreen}
        options={{
          title,
          headerBackHidden: true,
          headerRight: DismissPopupButton,
        }}
        initialParams={{action: 'restore', hide: true}}
      />
    </SignInStack.Navigator>
  );
};
