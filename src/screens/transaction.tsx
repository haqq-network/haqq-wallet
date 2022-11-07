import React from 'react';
import {RouteProp, useRoute} from '@react-navigation/native';
import {TransactionConfirmationScreen} from './transaction-confirmation';
import {TransactionFinishScreen} from './transaction-finish';
import {TransactionAddressScreen} from './transaction-address';
import {TransactionSumScreen} from './transaction-sum';
import {createStackNavigator} from '@react-navigation/stack';
import {TransactionAccountScreen} from './transaction-account';
import {useWallets} from '../contexts/wallets';
import {DismissPopupButton} from '../components/dismiss-popup-button';
import {TransactionSumAddressScreen} from './transaction-sum-address';
import {RootStackParamList, ScreenOptionType} from '../types';
import {TransactionLedgerScreen} from './transaction-ledger';
import {hideBack, popupScreenOptions} from '../helpers/screenOptions';
import {EditContactScreen} from './edit-contact';

const TransactionStack = createStackNavigator();

const screenOptions: ScreenOptionType = {title: '', headerBackHidden: true};

const screenOptionsSend: ScreenOptionType = {
  title: 'Send',
  ...hideBack,
};

const screenOptionsAddress: ScreenOptionType = {
  title: 'Address',
};

const screenOptionsSendFunds: ScreenOptionType = {
  title: 'Send funds from',
  ...hideBack,
};

const screenOptionsEditContact: ScreenOptionType = {
  title: 'Edit Contact',
};

export const TransactionScreen = () => {
  const wallets = useWallets();
  const route = useRoute<RouteProp<RootStackParamList, 'transaction'>>();

  const screenOptionsAddressRoute: ScreenOptionType = {
    title: 'Address',
    headerBackHidden: route.params.from || wallets.visible.length === 1,
    headerRight: DismissPopupButton,
  };

  return (
    <TransactionStack.Navigator
      screenOptions={popupScreenOptions}
      initialRouteName={
        route.params.from || wallets.visible.length === 1
          ? 'transactionAddress'
          : 'transactionAccount'
      }>
      <TransactionStack.Screen
        name="transactionAddress"
        component={TransactionAddressScreen}
        initialParams={{from: route.params.from, to: route.params.to}}
        options={screenOptionsAddressRoute}
      />
      <TransactionStack.Screen
        name="transactionSum"
        component={TransactionSumScreen}
        options={screenOptionsSend}
      />
      <TransactionStack.Screen
        name="transactionConfirmation"
        component={TransactionConfirmationScreen}
        options={{title: 'Preview'}}
      />
      <TransactionStack.Screen
        name="transactionFinish"
        component={TransactionFinishScreen}
        options={screenOptions}
      />
      <TransactionStack.Screen
        name="transactionAccount"
        initialParams={{to: route.params.to}}
        component={TransactionAccountScreen}
        options={screenOptionsSendFunds}
      />
      <TransactionStack.Screen
        name="transactionLedger"
        component={TransactionLedgerScreen}
        options={{title: 'Confirmation'}}
      />
      <TransactionStack.Screen
        name="transactionSumAddress"
        component={TransactionSumAddressScreen}
        options={screenOptionsAddress}
      />
      <TransactionStack.Screen
        name="transactionEditContact"
        component={EditContactScreen}
        options={screenOptionsEditContact}
      />
    </TransactionStack.Navigator>
  );
};
