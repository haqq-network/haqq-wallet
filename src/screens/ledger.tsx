import React from 'react';
import {PopupHeader} from '../components/popup-header';
import {createStackNavigator} from '@react-navigation/stack';
import {DismissPopupButton} from '../components/dismiss-popup-button';
import {ScreenOptionType} from '../types';
import {LedgerAgreementScreen} from './ledger-agreement';
import {LedgerFinishScreen} from './ledger-finish';
import {LedgerBluetoothScreen} from './ledger-bluetooth';
import {LedgerScanScreen} from './ledger-scan';
import {LedgerDeviceScreen} from './ledger-device';
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
        initialParams={{nextScreen: 'ledgerBluetooth'}}
      />
      <LedgerStack.Screen
        name="ledgerBluetooth"
        component={LedgerBluetoothScreen}
        options={screenOptionsTitle}
        initialParams={{nextScreen: 'ledgerScan'}}
      />
      <LedgerStack.Screen
        name="ledgerScan"
        component={LedgerScanScreen}
        options={screenOptionsTitle}
        initialParams={{nextScreen: 'ledgerDevice'}}
      />
      <LedgerStack.Screen
        name="ledgerDevice"
        component={LedgerDeviceScreen}
        options={screenOptionsTitle}
        initialParams={{nextScreen: 'ledgerVerify'}}
      />
      <LedgerStack.Screen
        name="ledgerVerify"
        component={LedgerVerifyScreen}
        options={screenOptionsTitle}
        initialParams={{nextScreen: 'ledgerFinish'}}
      />
      <LedgerStack.Screen
        name="ledgerFinish"
        component={LedgerFinishScreen}
        options={screenOptionsTitle}
        initialParams={{hide: true}}
      />
    </LedgerStack.Navigator>
  );
};
