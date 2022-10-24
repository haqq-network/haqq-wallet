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

const LedgerStack = createStackNavigator();

const title = 'Connect Ledger';

const screenOptionsTitle: ScreenOptionType = {
  title,
  headerBackHidden: true,
  headerRight: DismissPopupButton,
};

export const LedgerScreen = () => {
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
        options={{title: 'Verify'}}
      />
      <LedgerStack.Screen
        name="ledgerFinish"
        component={LedgerFinishScreen}
        options={
          {
            headerBackHidden: true,
            headerRight: DismissPopupButton,
          } as ScreenOptionType
        }
      />
    </LedgerStack.Navigator>
  );
};
