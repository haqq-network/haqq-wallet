import React, {memo, useCallback, useMemo} from 'react';

import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {I18N, getText} from '@app/i18n';
import {CloudProblemsScreen} from '@app/screens/cloud-problems';
import {WelcomeStackParamList} from '@app/screens/WelcomeStack';
import {
  OnboardingStack,
  OnboardingStackRoutes,
} from '@app/screens/WelcomeStack/OnboardingStack';
import {SignUpAgreementScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-agreement';
import {SignUpImportantInfoScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-important-info';
import {SignupNetworkExistsScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-network-exists';
import {SignupNetworksScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-networks';
import {SignupPinScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-pin';
import {SignUpStoreWalletScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-store-wallet';
import {SssProviders} from '@app/services/provider-sss';
import {AdjustEvents, WalletInitialData} from '@app/types';

export enum SignUpStackRoutes {
  SignUpAgreement = 'signupAgreement',
  SignUpNetworks = 'signupNetworks',
  SignUpNetworkExists = 'signupNetworkExists',
  SignUpPin = 'signupPin',
  OnboardingSetupPin = 'onboardingSetupPin',
  SignupStoreWallet = 'signupStoreWallet',
  SignupCloudProblems = 'cloudProblems',
  SignupImportantInfo = 'signupImportantInfo',
}

export type SignUpStackParamList = WelcomeStackParamList & {
  [SignUpStackRoutes.SignUpAgreement]: {
    nextScreen:
      | SignUpStackRoutes.OnboardingSetupPin
      | SignUpStackRoutes.SignUpNetworks;
  };
  [SignUpStackRoutes.SignUpNetworks]: WalletInitialData;
  [SignUpStackRoutes.SignUpNetworkExists]: {
    provider: SssProviders;
    email?: string;
  } & WalletInitialData;
  [SignUpStackRoutes.SignUpPin]: WalletInitialData;
  [SignUpStackRoutes.OnboardingSetupPin]: WalletInitialData;
  [SignUpStackRoutes.SignupStoreWallet]: WalletInitialData & {
    nextScreen?: SignUpStackRoutes;
  };
  [SignUpStackRoutes.SignupCloudProblems]: {
    sssProvider: SssProviders;
    onNext: () => void;
  };
  [SignUpStackRoutes.SignupImportantInfo]: {
    onNext: () => void;
  };
};

const Stack = createNativeStackNavigator<SignUpStackParamList>();

const title = getText(I18N.signUpTitle);
const screenOptionsTitleOnly: NativeStackNavigationOptions = {
  title,
};
const screenOptionsSignupStoreWallet = {
  title,
  headerShown: false,
};

const SignUpStack = memo(() => {
  const nextScreen = useMemo(() => {
    return isFeatureEnabled(Feature.sss)
      ? SignUpStackRoutes.SignUpNetworks
      : SignUpStackRoutes.OnboardingSetupPin;
  }, []);

  const OnboardingStackGenerated = useCallback(
    //@ts-ignore
    props => (
      <OnboardingStack
        initialParams={{
          [OnboardingStackRoutes.OnboardingSetupPin]: {...props.route.params},
          [OnboardingStackRoutes.OnboardingRepeatPin]: {
            nextScreen: SignUpStackRoutes.SignupStoreWallet,
          },
          [OnboardingStackRoutes.OnboardingBiometry]: {
            nextScreen: SignUpStackRoutes.SignupStoreWallet,
          },
          [OnboardingStackRoutes.OnboardingTrackUserActivity]: {
            nextScreen: SignUpStackRoutes.SignupStoreWallet,
          },
          [OnboardingStackRoutes.OnboardingFinish]: {
            nextScreen: undefined,
            action: 'create',
            event: AdjustEvents.accountCreated,
            onboarding: true,
          },
        }}
        title={title}
      />
    ),
    [],
  );

  return (
    <Stack.Navigator screenOptions={popupScreenOptions}>
      <Stack.Screen
        name={SignUpStackRoutes.SignUpAgreement}
        component={SignUpAgreementScreen}
        options={hideBack}
        initialParams={{nextScreen: nextScreen}}
      />
      <Stack.Screen
        name={SignUpStackRoutes.SignUpNetworks}
        component={SignupNetworksScreen}
        options={hideBack}
      />
      <Stack.Screen
        name={SignUpStackRoutes.SignUpNetworkExists}
        component={SignupNetworkExistsScreen}
        options={hideBack}
      />
      <Stack.Screen
        name={SignUpStackRoutes.SignUpPin}
        component={SignupPinScreen}
        options={screenOptionsTitleOnly}
      />
      <Stack.Screen
        name={SignUpStackRoutes.SignupStoreWallet}
        component={SignUpStoreWalletScreen}
        options={{...screenOptionsSignupStoreWallet, animation: 'none'}}
      />
      <Stack.Screen
        name={SignUpStackRoutes.SignupCloudProblems}
        component={CloudProblemsScreen}
        options={hideBack}
      />
      <Stack.Screen
        name={SignUpStackRoutes.SignupImportantInfo}
        component={SignUpImportantInfoScreen}
      />

      <Stack.Screen
        name={SignUpStackRoutes.OnboardingSetupPin}
        component={OnboardingStackGenerated}
        options={screenOptionsSignupStoreWallet}
      />
    </Stack.Navigator>
  );
});

export {SignUpStack};
