import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {ScreenOptionType} from '../types';
import {hideBack, popupScreenOptions} from '../helpers/screenOptions';
import {SignInRestoreScreen} from './signin-restore-wallet';
import {SignInAgreementScreen} from './signin-agreement';
import {OnboardingFinishScreen} from './onboarding-finish';
import {SigninStoreWalletScreen} from './signin-store-wallet';

const SignInStack = createStackNavigator();

const screenOptions: ScreenOptionType = {title: '', headerBackHidden: true};

const title = 'Restore wallet';

const screenOptionsTitle: ScreenOptionType = {
  title,
  ...hideBack,
};

export const RestoreScreen = () => {
  return (
    <SignInStack.Navigator screenOptions={popupScreenOptions}>
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
