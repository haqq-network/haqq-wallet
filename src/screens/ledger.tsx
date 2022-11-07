import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {LedgerAccountsScreen} from './ledger-accounts';
import {LedgerAgreementScreen} from './ledger-agreement';
import {LedgerBluetoothScreen} from './ledger-bluetooth';
import {LedgerFinishScreen} from './ledger-finish';
import {LedgerScanScreen} from './ledger-scan';
import {LedgerStoreWalletScreen} from './ledger-store-wallet';
import {LedgerVerifyScreen} from './ledger-verify';
import {OnboardingBiometryScreen} from './onboarding-biometry';
import {OnboardingRepeatPinScreen} from './onboarding-repeat-pin';
import {OnboardingSetupPinScreen} from './onboarding-setup-pin';

import {hideBack, popupScreenOptions} from '../helpers/screenOptions';
import {useUser} from '../hooks/use-user';
import {ScreenOptionType} from '../types';

const LedgerStack = createStackNavigator();

const title = 'Connect Ledger';

const screenOptionsTitle: ScreenOptionType = {
  title,
  ...hideBack,
};

const screenOptionsBiometry: ScreenOptionType = {title, headerBackHidden: true};

export const LedgerScreen = () => {
  const user = useUser();

  return (
    <LedgerStack.Navigator screenOptions={popupScreenOptions}>
      <LedgerStack.Screen
        name="ledgerAgreement"
        component={LedgerAgreementScreen}
        options={screenOptionsTitle}
      />
      <LedgerStack.Screen
        name="ledgerBluetooth"
        component={LedgerBluetoothScreen}
        options={screenOptionsTitle}
      />
      <LedgerStack.Screen
        name="ledgerScan"
        component={LedgerScanScreen}
        options={screenOptionsTitle}
      />
      <LedgerStack.Screen
        name="ledgerAccounts"
        component={LedgerAccountsScreen}
        options={{title: 'Choose account'}}
      />
      <LedgerStack.Screen
        name="ledgerVerify"
        component={LedgerVerifyScreen}
        options={{
          title: 'Verify',
        }}
        initialParams={{
          nextScreen: user.onboarded
            ? 'ledgerStoreWallet'
            : 'onboardingSetupPin',
        }}
      />
      <LedgerStack.Screen
        name="onboardingSetupPin"
        component={OnboardingSetupPinScreen}
        options={{title}}
      />
      <LedgerStack.Screen
        name="onboardingRepeatPin"
        component={OnboardingRepeatPinScreen}
        options={{title}}
        initialParams={{nextScreen: 'ledgerStoreWallet'}}
      />
      <LedgerStack.Screen
        name="onboardingBiometry"
        component={OnboardingBiometryScreen}
        options={screenOptionsBiometry}
        initialParams={{nextScreen: 'ledgerStoreWallet'}}
      />
      <LedgerStack.Screen
        name="ledgerStoreWallet"
        component={LedgerStoreWalletScreen}
        options={screenOptionsBiometry}
      />
      <LedgerStack.Screen
        name="ledgerFinish"
        component={LedgerFinishScreen}
        options={hideBack}
      />
    </LedgerStack.Navigator>
  );
};
