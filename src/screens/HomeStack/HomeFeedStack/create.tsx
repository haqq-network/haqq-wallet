import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {basicScreenOptions} from '@app/screens';
import {OnboardingFinishScreen} from '@app/screens/WelcomeStack/OnboardingStack/onboarding-finish';
import {SignUpAgreementScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-agreement';
import {SignUpStoreWalletScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-store-wallet';
import {MarketingEvents} from '@app/types';

const SignUpStack = createNativeStackNavigator();

export const CreateStack = memo(props => {
  return (
    <SignUpStack.Navigator screenOptions={basicScreenOptions}>
      <SignUpStack.Screen
        name="createAgreement"
        component={SignUpAgreementScreen}
        //@ts-ignore
        initialParams={{nextScreen: 'createStoreWallet', ...props.route.params}}
        options={{
          ...popupScreenOptions,
          title: getText(I18N.welcomeCreateWallet),
          ...hideBack,
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <SignUpStack.Screen
        name="createStoreWallet"
        component={SignUpStoreWalletScreen}
        options={{
          title: getText(I18N.welcomeCreateWallet),
          header: () => null,
        }}
        initialParams={{action: 'create', nextScreen: 'createFinish'}}
      />
      <SignUpStack.Screen
        name="createFinish"
        component={OnboardingFinishScreen}
        options={{
          ...popupScreenOptions,
          title: getText(I18N.welcomeCreateWallet),
          ...hideBack,
          presentation: 'modal',
          headerShown: true,
        }}
        initialParams={{
          action: 'create',
          hide: true,
          event: MarketingEvents.accountAdded,
        }}
      />
    </SignUpStack.Navigator>
  );
});
