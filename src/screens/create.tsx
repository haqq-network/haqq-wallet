import React from 'react';
import {SignUpAgreementScreen} from './signup-agreement';
import {PopupHeader} from '../components/popup-header';
import {CompositeScreenProps} from '@react-navigation/native';
import {OnboardingStoreWalletScreen} from './onboarding-store-wallet';
import {OnboardingFinishScreen} from './onboarding-finish';
import {createStackNavigator} from '@react-navigation/stack';

const SignUpStack = createStackNavigator();
type CreateScreenProp = CompositeScreenProps<any, any>;

export const CreateScreen = ({}: CreateScreenProp) => {
  const title = 'Create a wallet';
  return (
    <SignUpStack.Navigator screenOptions={{header: PopupHeader}}>
      <SignUpStack.Screen
        name="restoreAgreement"
        component={SignUpAgreementScreen}
        initialParams={{nextScreen: 'restoreStoreWallet'}}
      />
      <SignUpStack.Screen
        name="restoreStoreWallet"
        component={OnboardingStoreWalletScreen}
        options={{
          title,
          header: () => null,
        }}
        initialParams={{action: 'create', nextScreen: 'restoreFinish'}}
      />
      <SignUpStack.Screen
        name="restoreFinish"
        component={OnboardingFinishScreen}
        options={{title}}
        initialParams={{action: 'create'}}
      />
    </SignUpStack.Navigator>
  );
};
