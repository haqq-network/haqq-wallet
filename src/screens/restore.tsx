import React from 'react';
import {PopupHeader} from '../components/popup-header';
import {SignInRestoreScreen} from './signin-restore-wallet';
import {SignInAgreementScreen} from './signin-agreement';
import {OnboardingFinishScreen} from './onboarding-finish';
import {createStackNavigator} from '@react-navigation/stack';
import {DismissPopupButton} from '../components/dismiss-popup-button';
import {SigninStoreWalletScreen} from './signin-store-wallet';
import {ScreenOptionType} from '../types';

const SignInStack = createStackNavigator();

const screenOptions: ScreenOptionType = {title: '', headerBackHidden: true};

const title = 'Restore wallet';

const screenOptionsTitle: ScreenOptionType = {
  title,
  headerBackHidden: true,
  headerRight: DismissPopupButton,
};

export const RestoreScreen = () => {
  return (
    <SignInStack.Navigator
      screenOptions={{
        header: PopupHeader,
      }}>
      <SignInStack.Screen
        name="restoreAgreement"
        component={SignInAgreementScreen}
        options={screenOptionsTitle}
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
        options={screenOptions}
        initialParams={{nextScreen: 'restoreFinish'}}
      />
      <SignInStack.Screen
        name="restoreFinish"
        component={OnboardingFinishScreen}
        options={screenOptionsTitle}
        initialParams={{action: 'restore', hide: true}}
      />
    </SignInStack.Navigator>
  );
};
