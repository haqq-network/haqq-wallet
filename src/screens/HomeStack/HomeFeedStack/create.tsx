import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {basicScreenOptions} from '@app/screens';
import {OnboardingFinishScreen} from '@app/screens/WelcomeStack/OnboardingStack/onboarding-finish';
import {SignUpAgreementScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-agreement';
import {SignUpStoreWalletScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-store-wallet';
import {AdjustEvents, ScreenOptionType} from '@app/types';

const SignUpStack = createNativeStackNavigator();

const title = 'Create a wallet';
const screenOptionsTitle: ScreenOptionType = {
  ...popupScreenOptions,
  title,
  ...hideBack,
  presentation: 'modal',
  headerShown: true,
};

export const CreateStack = memo(props => {
  return (
    <SignUpStack.Navigator screenOptions={basicScreenOptions}>
      <SignUpStack.Screen
        name="createAgreement"
        component={SignUpAgreementScreen}
        //@ts-ignore
        initialParams={{nextScreen: 'createStoreWallet', ...props.route.params}}
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
});
