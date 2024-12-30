import React, {memo, useCallback} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {I18N, getText} from '@app/i18n';
import {
  OnboardingStackRoutes,
  SignUpStackParamList,
  SignUpStackRoutes,
} from '@app/route-types';
import {CloudProblemsScreen} from '@app/screens/cloud-problems';
import {OnboardingStack} from '@app/screens/WelcomeStack/OnboardingStack';
import {SignUpImportantInfoScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-important-info';
import {SignupNetworksScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-networks';
import {SignupPinScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-pin';
import {SignUpStoreWalletScreen} from '@app/screens/WelcomeStack/SignUpStack/signup-store-wallet';
import {MarketingEvents} from '@app/types';

const Stack = createNativeStackNavigator<SignUpStackParamList>();

const SignUpStack = memo(() => {
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
            event: MarketingEvents.accountCreated,
            onboarding: true,
          },
        }}
        title={getText(I18N.signUpTitle)}
      />
    ),
    [],
  );

  return (
    <Stack.Navigator screenOptions={popupScreenOptions}>
      <Stack.Screen
        name={SignUpStackRoutes.SignUpNetworks}
        component={themeUpdaterHOC(SignupNetworksScreen)}
        options={hideBack}
      />
      <Stack.Screen
        name={SignUpStackRoutes.SignUpPin}
        component={themeUpdaterHOC(SignupPinScreen)}
        options={{
          title: getText(I18N.signUpTitle),
        }}
      />
      <Stack.Screen
        name={SignUpStackRoutes.SignupStoreWallet}
        component={SignUpStoreWalletScreen}
        options={{
          title: getText(I18N.signUpTitle),
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={SignUpStackRoutes.SignupCloudProblems}
        component={themeUpdaterHOC(CloudProblemsScreen)}
        options={hideBack}
      />
      <Stack.Screen
        name={SignUpStackRoutes.SignupImportantInfo}
        component={themeUpdaterHOC(SignUpImportantInfoScreen)}
      />

      <Stack.Screen
        name={SignUpStackRoutes.OnboardingSetupPin}
        component={OnboardingStackGenerated}
        options={{
          title: getText(I18N.signUpTitle),
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
});

export {SignUpStack};
