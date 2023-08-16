import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {ModalsScreenConnected} from '@app/screens/modals-screen';
import {WelcomeStackRoutes} from '@app/screens/WelcomeStack';
import {OnboardingFinishScreen} from '@app/screens/WelcomeStack/OnboardingStack/onboarding-finish';
import {SignUpAgreementScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-agreement';
import {SignUpStoreWalletScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-store-wallet';
import {AdjustEvents, ScreenOptionType} from '@app/types';

const SignUpStack = createNativeStackNavigator();

const title = 'Create a wallet';
const screenOptionsTitle: ScreenOptionType = {
  title,
  ...hideBack,
};

export const CreateStack = memo(() => {
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

      <SignUpStack.Screen
        component={ModalsScreenConnected}
        name={WelcomeStackRoutes.Modal}
        options={{presentation: 'fullScreenModal', animation: 'fade'}}
      />
    </SignUpStack.Navigator>
  );
});
