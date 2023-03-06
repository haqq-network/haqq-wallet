import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {MpcFinishScreen} from '@app/screens/mpc-finish';
import {MpcNetworksScreen} from '@app/screens/mpc-networks';
import {MpcQuestionScreen} from '@app/screens/mpc-question';
import {MpcStoreWalletScreen} from '@app/screens/mpc-store-wallet';
import {OnboardingBiometryScreen} from '@app/screens/onboarding-biometry';
import {OnboardingRepeatPinScreen} from '@app/screens/onboarding-repeat-pin';
import {OnboardingSetupPinScreen} from '@app/screens/onboarding-setup-pin';
import {ScreenOptionType} from '@app/types';

const MpcStack = createStackNavigator();

const title = getText(I18N.mpcConnect);

const screenOptionsBiometry: ScreenOptionType = {title, headerBackHidden: true};

export const MpcScreen = () => {
  return (
    <MpcStack.Navigator screenOptions={popupScreenOptions}>
      <MpcStack.Screen
        name="mpcNetworks"
        component={MpcNetworksScreen}
        options={hideBack}
      />
      <MpcStack.Screen
        name="mpcQuestion"
        component={MpcQuestionScreen}
        options={hideBack}
      />
      <MpcStack.Screen
        name="onboardingSetupPin"
        component={OnboardingSetupPinScreen}
        options={{title}}
      />
      <MpcStack.Screen
        name="onboardingRepeatPin"
        component={OnboardingRepeatPinScreen}
        options={{title}}
        initialParams={{nextScreen: 'mpcStoreWallet'}}
      />
      <MpcStack.Screen
        name="onboardingBiometry"
        component={OnboardingBiometryScreen}
        options={screenOptionsBiometry}
        initialParams={{nextScreen: 'mpcStoreWallet'}}
      />
      <MpcStack.Screen
        name="mpcStoreWallet"
        component={MpcStoreWalletScreen}
        options={hideBack}
      />
      <MpcStack.Screen
        name="mpcFinish"
        component={MpcFinishScreen}
        options={hideBack}
      />
    </MpcStack.Navigator>
  );
};
