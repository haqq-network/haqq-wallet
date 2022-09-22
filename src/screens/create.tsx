import React from 'react';
import {SignUpAgreementScreen} from './signup-agreement';
import {PopupHeader} from '../components/popup-header';
import {CompositeScreenProps} from '@react-navigation/native';
import {OnboardingStoreWalletScreen} from './onboarding-store-wallet';
import {OnboardingFinishScreen} from './onboarding-finish';
import {createStackNavigator} from '@react-navigation/stack';
import {DismissPopupButton} from '../components/dismiss-popup-button';

const SignUpStack = createStackNavigator();
type CreateScreenProp = CompositeScreenProps<any, any>;

export const CreateScreen = ({}: CreateScreenProp) => {
  const title = 'Create a wallet';
  return (
    <SignUpStack.Navigator screenOptions={{header: PopupHeader}}>
      <SignUpStack.Screen
        name="createAgreement"
        component={SignUpAgreementScreen}
        initialParams={{nextScreen: 'createStoreWallet'}}
        options={{
          title,
          headerBackHidden: true,
          headerRight: DismissPopupButton,
        }}
      />
      <SignUpStack.Screen
        name="createStoreWallet"
        component={OnboardingStoreWalletScreen}
        options={{
          title,
          header: () => null,
        }}
        initialParams={{action: 'create', nextScreen: 'createFinish'}}
      />
      <SignUpStack.Screen
        name="createFinish"
        component={OnboardingFinishScreen}
        options={{
          title,
          headerBackHidden: true,
          headerRight: DismissPopupButton,
        }}
        initialParams={{action: 'create', hide: true}}
      />
    </SignUpStack.Navigator>
  );
};
