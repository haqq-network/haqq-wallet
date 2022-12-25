import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {OnboardingFinishScreen} from '@app/screens/onboarding-finish';
import {SignInAgreementScreen} from '@app/screens/signin-agreement';
import {SignInRestoreScreen} from '@app/screens/signin-restore-wallet';
import {SignInStoreWalletScreen} from '@app/screens/signin-store-wallet';
import {ScreenOptionType} from '@app/types';

const SignInStack = createStackNavigator();

const screenOptions: ScreenOptionType = {
  title: '',
  headerBackHidden: true,
  tab: false,
};

const title = getText(I18N.restoreWalletScreenTitle);

const restoreScreenOptions: ScreenOptionType = {
  title: '',
  ...hideBack,
  headerBackHidden: true,
};

export const RestoreScreen = () => {
  return (
    <SignInStack.Navigator screenOptions={popupScreenOptions}>
      <SignInStack.Screen
        name="restoreAgreement"
        component={SignInAgreementScreen}
        options={restoreScreenOptions}
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
        component={SignInStoreWalletScreen}
        options={screenOptions}
        initialParams={{nextScreen: 'restoreFinish'}}
      />
      <SignInStack.Screen
        name="restoreFinish"
        component={OnboardingFinishScreen}
        options={screenOptions}
        initialParams={{action: 'restore', hide: true}}
      />
    </SignInStack.Navigator>
  );
};
