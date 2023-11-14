import React, {memo, useCallback, useMemo} from 'react';

import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {I18N, getText} from '@app/i18n';
import {ChooseAccountScreen} from '@app/screens/choose-account-screen';
import {CloudProblemsScreen} from '@app/screens/cloud-problems';
import {
  WelcomeStackParamList,
  WelcomeStackRoutes,
} from '@app/screens/WelcomeStack';
import {
  OnboardingStack,
  OnboardingStackRoutes,
} from '@app/screens/WelcomeStack/OnboardingStack';
import {SignInAgreementScreen} from '@app/screens/WelcomeStack/SignInStack/signin-agreement';
import {SignInNetworksScreen} from '@app/screens/WelcomeStack/SignInStack/signin-networks';
import {SigninNotExistsScreen} from '@app/screens/WelcomeStack/SignInStack/signin-not-exists';
import {SigninNotRecoveryScreen} from '@app/screens/WelcomeStack/SignInStack/signin-not-recovery';
import {SignInPinScreen} from '@app/screens/WelcomeStack/SignInStack/signin-pin';
import {SignInRestoreScreen} from '@app/screens/WelcomeStack/SignInStack/signin-restore-wallet';
import {SigninSharesNotFoundScreen} from '@app/screens/WelcomeStack/SignInStack/signin-shares-not-found';
import {SignInStoreWalletScreen} from '@app/screens/WelcomeStack/SignInStack/signin-store-wallet';
import {SssProviders} from '@app/services/provider-sss';
import {
  AdjustEvents,
  BiometryType,
  ScreenOptionType,
  WalletInitialData,
} from '@app/types';

export enum SignInStackRoutes {
  SigninNetworks = 'signinNetworks',
  SigninAgreement = 'signinAgreement',
  SigninRestoreWallet = 'signinRestoreWallet',
  SigninPin = 'signinPin',
  OnboardingSetupPin = 'onboardingSetupPin',
  SigninStoreWallet = 'signinStoreWallet',
  SigninNotExists = 'signinNotExists',
  SigninNotRecovery = 'signinNotRecovery',
  SigninCloudProblems = 'cloudProblems',
  SigninChooseAccount = 'chooseAccount',
  SigninSharesNotFound = 'signinSharesNotFound',
}

export type SignInStackParamList = WelcomeStackParamList & {
  [SignInStackRoutes.SigninNetworks]?: WelcomeStackParamList[WelcomeStackRoutes.SignIn];
  [SignInStackRoutes.SigninAgreement]?: WelcomeStackParamList[WelcomeStackRoutes.SignIn];
  [SignInStackRoutes.SigninRestoreWallet]: undefined;
  [SignInStackRoutes.SigninPin]: WalletInitialData;
  [SignInStackRoutes.SigninSharesNotFound]: undefined;
  [SignInStackRoutes.OnboardingSetupPin]: WalletInitialData & {
    provider?: ProviderMnemonicReactNative | ProviderSSSReactNative;
    biometryType?: BiometryType;
  };
  [SignInStackRoutes.SigninStoreWallet]: WalletInitialData & {
    nextScreen?: SignInStackRoutes;
  };
  [SignInStackRoutes.SigninNotExists]: WalletInitialData & {
    provider: ProviderMnemonicReactNative | ProviderSSSReactNative;
    email?: string;
  };
  [SignInStackRoutes.SigninNotRecovery]: WalletInitialData;
  [SignInStackRoutes.SigninCloudProblems]: {
    sssProvider: SssProviders;
    onNext: () => void;
  };
  [SignInStackRoutes.SigninChooseAccount]:
    | (WalletInitialData & {
        provider: ProviderMnemonicReactNative;
        nextScreen?: SignInStackRoutes;
      })
    | {
        provider: ProviderSSSReactNative;
        nextScreen?: SignInStackRoutes;
      };
};

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
        component={SignInNetworksScreen}
        options={{...hideBack, ...screenOptions}}
      />
      <Stack.Screen
        name={SignInStackRoutes.SigninAgreement}
        component={SignInAgreementScreen}
        options={{...hideBack, ...screenOptions}}
      />

      <Stack.Screen
        name={SignInStackRoutes.SigninNotExists}
        component={SigninNotExistsScreen}
        options={{...hideBack, ...screenOptions}}
      />

      <Stack.Screen
        name={SignInStackRoutes.SigninNotRecovery}
        component={SigninNotRecoveryScreen}
        options={{...hideBack, ...screenOptions}}
      />

      <Stack.Screen
        name={SignInStackRoutes.SigninSharesNotFound}
        component={SigninSharesNotFoundScreen}
        options={{...hideBack, ...screenOptions}}
      />

      <Stack.Screen
        name={SignInStackRoutes.SigninRestoreWallet}
        component={SignInRestoreScreen}
        options={{title}}
      />
      <Stack.Screen
        name={SignInStackRoutes.SigninPin}
        component={SignInPinScreen}
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
        component={ChooseAccountScreen}
        options={{title: getText(I18N.ledgerChooseAccount)}}
        initialParams={{nextScreen: SignInStackRoutes.SigninStoreWallet}}
      />

      <Stack.Screen
        name={SignInStackRoutes.SigninCloudProblems}
        component={CloudProblemsScreen}
        options={{...hideBack, ...screenOptions}}
      />
    </Stack.Navigator>
  );
});

export {SignInStack};
