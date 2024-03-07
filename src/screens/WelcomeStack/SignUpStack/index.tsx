import React, {memo, useCallback, useMemo} from 'react';

import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {Platform} from 'react-native';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {I18N, getText} from '@app/i18n';
import {
  OnboardingStackRoutes,
  SignUpStackParamList,
  SignUpStackRoutes,
} from '@app/route-types';
import {CloudProblemsScreen} from '@app/screens/cloud-problems';
import {OnboardingStack} from '@app/screens/WelcomeStack/OnboardingStack';
import {SignUpAgreementScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-agreement';
import {SignUpImportantInfoScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-important-info';
import {SignupNetworkExistsScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-network-exists';
import {SignupNetworksScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-networks';
import {SignupPinScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-pin';
import {SignUpStoreWalletScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-store-wallet';
import {AdjustEvents} from '@app/types';

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
        options={{
          ...hideBack,
          headerShown: Platform.OS === 'ios',
        }}
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
