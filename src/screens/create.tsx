import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {AdjustEvents, ScreenOptionType} from '@app/types';

import {OnboardingFinishScreen} from './onboarding-finish';
import {SignUpAgreementScreen} from './signup-agreement';
import {SignUpStoreWalletScreen} from './signup-store-wallet';

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
        component={SignUpStoreWalletScreen}
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
        initialParams={{
          action: 'create',
          hide: true,
          event: AdjustEvents.accountAdded,
        }}
      />
    </SignUpStack.Navigator>
  );
};
