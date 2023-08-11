import React, {memo, useCallback} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {LedgerAccountsScreen} from '@app/screens/ledger-accounts';
import {LedgerAgreementScreen} from '@app/screens/ledger-agreement';
import {LedgerBluetoothScreen} from '@app/screens/ledger-bluetooth';
import {LedgerFinishScreen} from '@app/screens/ledger-finish';
import {LedgerScanScreen} from '@app/screens/ledger-scan';
import {LedgerStoreWalletScreen} from '@app/screens/ledger-store-wallet';
import {LedgerVerifyScreen} from '@app/screens/ledger-verify';
import {
  WelcomeStackParamList,
  WelcomeStackRoutes,
} from '@app/screens/WelcomeStack';
import {
  OnboardingStack,
  OnboardingStackRoutes,
} from '@app/screens/WelcomeStack/OnboardingStack';
import {ScreenOptionType, WalletInitialData} from '@app/types';

export enum LedgerStackRoutes {
  LedgerAgreement = 'ledgerAgreement',
  LedgerBluetooth = 'ledgerBluetooth',
  LedgerScan = 'ledgerScan',
  LedgerAccounts = 'ledgerAccounts',
  LedgerVerify = 'ledgerVerify',
  OnboardingSetupPin = 'onboardingSetupPin',
  LedgerStoreWallet = 'ledgerStoreWallet',
  LedgerFinish = 'ledgerFinish',
}

export type LedgerStackParamList = WelcomeStackParamList & {
  [LedgerStackRoutes.LedgerAgreement]: WelcomeStackParamList[WelcomeStackRoutes.Ledger];
  [LedgerStackRoutes.LedgerBluetooth]: undefined;
  [LedgerStackRoutes.LedgerScan]: undefined;
  [LedgerStackRoutes.LedgerAccounts]: {deviceId: string; deviceName: string};
  [LedgerStackRoutes.LedgerVerify]: WalletInitialData & {
    nextScreen:
      | LedgerStackRoutes.LedgerStoreWallet
      | LedgerStackRoutes.OnboardingSetupPin;
  };
  [LedgerStackRoutes.OnboardingSetupPin]: WalletInitialData;
  [LedgerStackRoutes.LedgerStoreWallet]: WalletInitialData;
  [LedgerStackRoutes.LedgerFinish]: undefined;
};

const Stack = createNativeStackNavigator<LedgerStackParamList>();
const title = getText(I18N.ledgerConnect);

const screenOptionsBiometry: ScreenOptionType = {title, headerBackHidden: true};

const LedgerStack = memo(() => {
  const OnboardingStackGenerated = useCallback(
    () => (
      <OnboardingStack
        initialParams={{
          [OnboardingStackRoutes.OnboardingSetupPin]: {},
          [OnboardingStackRoutes.OnboardingRepeatPin]: {
            nextScreen: LedgerStackRoutes.LedgerStoreWallet,
          },
          [OnboardingStackRoutes.OnboardingBiometry]: {
            nextScreen: LedgerStackRoutes.LedgerStoreWallet,
          },
          [OnboardingStackRoutes.OnboardingTrackUserActivity]: {
            nextScreen: LedgerStackRoutes.LedgerStoreWallet,
          },
          [OnboardingStackRoutes.OnboardingFinish]: {},
        }}
        title={title}
      />
    ),
    [],
  );

  return (
    <Stack.Navigator screenOptions={popupScreenOptions}>
      <Stack.Screen
        name={LedgerStackRoutes.LedgerAgreement}
        component={LedgerAgreementScreen}
        options={hideBack}
      />
      <Stack.Screen
        name={LedgerStackRoutes.LedgerBluetooth}
        component={LedgerBluetoothScreen}
        options={hideBack}
      />
      <Stack.Screen
        name={LedgerStackRoutes.LedgerScan}
        component={LedgerScanScreen}
        options={{
          title,
          ...hideBack,
        }}
      />
      <Stack.Screen
        name={LedgerStackRoutes.LedgerAccounts}
        component={LedgerAccountsScreen}
        options={{title: getText(I18N.ledgerChooseAccount)}}
      />
      <Stack.Screen
        name={LedgerStackRoutes.LedgerVerify}
        component={LedgerVerifyScreen}
        options={{title: getText(I18N.ledgerVerify)}}
      />
      <Stack.Screen
        name={LedgerStackRoutes.LedgerStoreWallet}
        component={LedgerStoreWalletScreen}
        options={screenOptionsBiometry}
      />
      <Stack.Screen
        name={LedgerStackRoutes.LedgerFinish}
        component={LedgerFinishScreen}
        options={hideBack}
      />

      <Stack.Screen
        name={LedgerStackRoutes.OnboardingSetupPin}
        component={OnboardingStackGenerated}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
});

export {LedgerStack};
