import React, {memo, useCallback, useMemo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {I18N, getText} from '@app/i18n';
import {
  OnboardingStackRoutes,
  SignInStackParamList,
  SignInStackRoutes,
} from '@app/route-types';
import {ChooseAccountScreen} from '@app/screens/choose-account-screen';
import {CloudProblemsScreen} from '@app/screens/cloud-problems';
import {OnboardingStack} from '@app/screens/WelcomeStack/OnboardingStack';
import {SignInAgreementScreen} from '@app/screens/WelcomeStack/SignInStack/signin-agreement';
import {SignInNetworksScreen} from '@app/screens/WelcomeStack/SignInStack/signin-networks';
import {SigninNotExistsScreen} from '@app/screens/WelcomeStack/SignInStack/signin-not-exists';
import {SigninNotRecoveryScreen} from '@app/screens/WelcomeStack/SignInStack/signin-not-recovery';
import {SignInPinScreen} from '@app/screens/WelcomeStack/SignInStack/signin-pin';
import {SignInRestoreScreen} from '@app/screens/WelcomeStack/SignInStack/signin-restore-wallet';
import {SigninSharesNotFoundScreen} from '@app/screens/WelcomeStack/SignInStack/signin-shares-not-found';
import {SignInStoreWalletScreen} from '@app/screens/WelcomeStack/SignInStack/signin-store-wallet';
import {AdjustEvents, ScreenOptionType} from '@app/types';

const Stack = createNativeStackNavigator<SignInStackParamList>();

const screenOptions: ScreenOptionType = {
  title: '',
  headerBackHidden: true,
};
const title = getText(I18N.signInTitle);

const SignInStack = memo(() => {
  const inittialRouteName = useMemo(() => {
    return isFeatureEnabled(Feature.sss)
      ? SignInStackRoutes.SigninNetworks
      : SignInStackRoutes.SigninAgreement;
  }, []);

  const OnboardingStackGenerated = useCallback(
    //@ts-ignore
    props => (
      <OnboardingStack
        initialParams={{
          [OnboardingStackRoutes.OnboardingSetupPin]: {...props.route.params},
          [OnboardingStackRoutes.OnboardingRepeatPin]: {
            nextScreen: SignInStackRoutes.SigninStoreWallet,
          },
          [OnboardingStackRoutes.OnboardingBiometry]: {
            nextScreen: SignInStackRoutes.SigninStoreWallet,
          },
          [OnboardingStackRoutes.OnboardingTrackUserActivity]: {
            nextScreen: SignInStackRoutes.SigninStoreWallet,
          },
          [OnboardingStackRoutes.OnboardingFinish]: {
            action: 'restore' as 'restore',
            event: AdjustEvents.accountRestored,
            onboarding: true,
          },
        }}
        title={title}
      />
    ),
    [],
  );

  return (
    <Stack.Navigator
      screenOptions={popupScreenOptions}
      initialRouteName={inittialRouteName}>
      <Stack.Screen
        name={SignInStackRoutes.SigninNetworks}
        component={themeUpdaterHOC(SignInNetworksScreen)}
        options={{...hideBack, ...screenOptions}}
      />
      <Stack.Screen
        name={SignInStackRoutes.SigninAgreement}
        component={themeUpdaterHOC(SignInAgreementScreen)}
        options={{...hideBack, ...screenOptions}}
      />

      <Stack.Screen
        name={SignInStackRoutes.SigninNotExists}
        component={themeUpdaterHOC(SigninNotExistsScreen)}
        options={{...hideBack, ...screenOptions}}
      />

      <Stack.Screen
        name={SignInStackRoutes.SigninNotRecovery}
        component={themeUpdaterHOC(SigninNotRecoveryScreen)}
        options={{...hideBack, ...screenOptions}}
      />

      <Stack.Screen
        name={SignInStackRoutes.SigninSharesNotFound}
        component={themeUpdaterHOC(SigninSharesNotFoundScreen)}
        options={{...hideBack, ...screenOptions}}
      />

      <Stack.Screen
        name={SignInStackRoutes.SigninRestoreWallet}
        component={themeUpdaterHOC(SignInRestoreScreen)}
        options={{title}}
      />
      <Stack.Screen
        name={SignInStackRoutes.SigninPin}
        component={themeUpdaterHOC(SignInPinScreen)}
        options={{title}}
      />
      <Stack.Screen
        name={SignInStackRoutes.SigninStoreWallet}
        component={SignInStoreWalletScreen}
        options={screenOptions}
      />

      <Stack.Screen
        name={SignInStackRoutes.OnboardingSetupPin}
        component={OnboardingStackGenerated}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name={SignInStackRoutes.SigninChooseAccount}
        component={themeUpdaterHOC(ChooseAccountScreen)}
        options={{title: getText(I18N.ledgerChooseAccount)}}
        initialParams={{nextScreen: SignInStackRoutes.SigninStoreWallet}}
      />

      <Stack.Screen
        name={SignInStackRoutes.SigninCloudProblems}
        component={themeUpdaterHOC(CloudProblemsScreen)}
        options={{...hideBack, ...screenOptions}}
      />
    </Stack.Navigator>
  );
});

export {SignInStack};
