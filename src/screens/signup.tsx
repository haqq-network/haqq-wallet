import React, {useMemo} from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/isFeatureEnabled';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {OnboardingBiometryScreen} from '@app/screens/onboarding-biometry';
import {OnboardingFinishScreen} from '@app/screens/onboarding-finish';
import {OnboardingRepeatPinScreen} from '@app/screens/onboarding-repeat-pin';
import {OnboardingSetupPinScreen} from '@app/screens/onboarding-setup-pin';
import {SignUpAgreementScreen} from '@app/screens/signup-agreement';
import {SignupNetworkExistsScreen} from '@app/screens/signup-network-exists';
import {SignupNetworksScreen} from '@app/screens/signup-networks';
import {SignupPinScreen} from '@app/screens/signup-pin';
import {SignUpStoreWalletScreen} from '@app/screens/signup-store-wallet';
import {ScreenOptionType} from '@app/types';

const SignUpStack = createStackNavigator();

const screenOptions: ScreenOptionType = {
  title: '',
  headerBackHidden: true,
};

const title = getText(I18N.signUpTitle);

const screenOptionsBiometry: ScreenOptionType = {
  title,
  headerBackHidden: true,
};

export const SignUpScreen = () => {
  const route = useTypedRoute<'signup'>();

  const nextScreen = useMemo(() => {
    return isFeatureEnabled(Feature.mpc)
      ? 'signupNetworks'
      : 'onboardingSetupPin';
  }, []);

  return (
    <SignUpStack.Navigator screenOptions={popupScreenOptions}>
      <SignUpStack.Screen
        name="signupAgreement"
        component={SignUpAgreementScreen}
        options={hideBack}
        initialParams={{next: route.params.next, nextScreen: nextScreen}}
      />
      <SignUpStack.Screen
        name="signupNetworks"
        component={SignupNetworksScreen}
        options={hideBack}
      />
      <SignUpStack.Screen
        name="signupNetworkExists"
        component={SignupNetworkExistsScreen}
        options={hideBack}
      />
      <SignUpStack.Screen
        name="signupPin"
        component={SignupPinScreen}
        options={{title}}
      />
      <SignUpStack.Screen
        name="onboardingSetupPin"
        component={OnboardingSetupPinScreen}
        options={{title}}
      />
      <SignUpStack.Screen
        name="onboardingRepeatPin"
        component={OnboardingRepeatPinScreen}
        options={{title}}
        initialParams={{nextScreen: 'signupStoreWallet'}}
      />
      <SignUpStack.Screen
        name="onboardingBiometry"
        component={OnboardingBiometryScreen}
        options={screenOptionsBiometry}
        initialParams={{nextScreen: 'signupStoreWallet'}}
      />
      <SignUpStack.Screen
        name="signupStoreWallet"
        component={SignUpStoreWalletScreen}
        options={{
          title,
          header: () => null,
        }}
        initialParams={{action: 'create'}}
      />
      <SignUpStack.Screen
        name="onboardingFinish"
        component={OnboardingFinishScreen}
        initialParams={{action: 'create'}}
        options={screenOptions}
      />
    </SignUpStack.Navigator>
  );
};
