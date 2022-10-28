import React from 'react';
import {PopupHeader} from '../components/popup-header';
import {createStackNavigator} from '@react-navigation/stack';
import {DismissPopupButton} from '../components/dismiss-popup-button';
import {ScreenOptionType} from '../types';
import {LedgerAgreementScreen} from './ledger-agreement';
import {LedgerFinishScreen} from './ledger-finish';
import {LedgerBluetoothScreen} from './ledger-bluetooth';
import {LedgerScanScreen} from './ledger-scan';
import {LedgerAccountsScreen} from './ledger-accounts';
import {LedgerVerifyScreen} from './ledger-verify';
import {hideBack} from '../helpers/screenOptions';
import {useUser} from '../contexts/app';
import {OnboardingSetupPinScreen} from './onboarding-setup-pin';
import {OnboardingRepeatPinScreen} from './onboarding-repeat-pin';
import {OnboardingBiometryScreen} from './onboarding-biometry';
import {LedgerStoreWalletScreen} from './ledger-store-wallet';

const LedgerStack = createStackNavigator();

const title = 'Connect Ledger';

const screenOptionsTitle: ScreenOptionType = {
  title,
  headerBackHidden: true,
  headerRight: DismissPopupButton,
};

const screenOptionsBiometry: ScreenOptionType = {title, headerBackHidden: true};

export const LedgerScreen = () => {
  const user = useUser();

  return (
    <LedgerStack.Navigator
      screenOptions={{
        header: PopupHeader,
      }}>
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
