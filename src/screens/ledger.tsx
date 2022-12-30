import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {ScreenOptionType} from '@app/types';

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

const LedgerStack = createStackNavigator();

const title = getText(I18N.ledgerConnect);

const screenOptionsBiometry: ScreenOptionType = {title, headerBackHidden: true};

export const LedgerScreen = () => {
  return (
    <LedgerStack.Navigator screenOptions={popupScreenOptions}>
      <LedgerStack.Screen
        name="ledgerAgreement"
        component={LedgerAgreementScreen}
        options={hideBack}
      />
      <LedgerStack.Screen
        name="ledgerBluetooth"
        component={LedgerBluetoothScreen}
        options={hideBack}
      />
      <LedgerStack.Screen
        name="ledgerScan"
        component={LedgerScanScreen}
        options={{
          title,
          ...hideBack,
        }}
      />
      <LedgerStack.Screen
        name="ledgerAccounts"
        component={LedgerAccountsScreen}
        options={{title: getText(I18N.ledgerChooseAccount)}}
      />
      <LedgerStack.Screen
        name="ledgerVerify"
        component={LedgerVerifyScreen}
        options={{title: getText(I18N.ledgerVerify)}}
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
