import React from 'react';
import {SignUpAgreementScreen} from './signup-agreement';
import {PopupHeader} from '../components/popup-header';
import {CompositeScreenProps} from '@react-navigation/native';
import {SignupStoreWalletScreen} from './signup-store-wallet';
import {OnboardingFinishScreen} from './onboarding-finish';
import {createStackNavigator} from '@react-navigation/stack';
import {DismissPopupButton} from '../components/dismiss-popup-button';
import {ScreenOptionType} from '../types';

const SignUpStack = createStackNavigator();
type CreateScreenProp = CompositeScreenProps<any, any>;

const title = 'Create a wallet';
const screenOptionsTitle: ScreenOptionType = {
  title,
  headerBackHidden: true,
  headerRight: DismissPopupButton,
};

export const CreateScreen = ({}: CreateScreenProp) => {
  return (
    <SignUpStack.Navigator screenOptions={{header: PopupHeader}}>
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
