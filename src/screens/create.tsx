import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {ScreenOptionType} from '../types';
import {hideBack, popupScreenOptions} from '../helpers/screenOptions';
import {SignUpAgreementScreen} from './signup-agreement';
import {SignupStoreWalletScreen} from './signup-store-wallet';
import {OnboardingFinishScreen} from './onboarding-finish';

const SignUpStack = createStackNavigator();

const title = 'Create a wallet';
const screenOptionsTitle: ScreenOptionType = {
  title,
  ...hideBack,
};

export const CreateScreen = () => {
  return (
    <SignUpStack.Navigator screenOptions={popupScreenOptions}>
      <SignUpStack.Screen
        name="createAgreement"
        component={SignUpAgreementScreen}
        initialParams={{nextScreen: 'createStoreWallet'}}
        options={screenOptionsTitle}
      />
      <SignUpStack.Screen
        name="createStoreWallet"
        component={SignupStoreWalletScreen}
        options={{
          title,
          header: () => null,
        }}
        initialParams={{action: 'create', nextScreen: 'createFinish'}}
      />
      <SignUpStack.Screen
        name="createFinish"
        component={OnboardingFinishScreen}
        options={screenOptionsTitle}
        initialParams={{action: 'create', hide: true}}
      />
    </SignUpStack.Navigator>
  );
};
