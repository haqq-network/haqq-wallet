import React from 'react';
import {PopupHeader} from '../components/popup-header';
import {CompositeScreenProps} from '@react-navigation/native';
import {TransactionConfirmationScreen} from './transaction-confirmation';
import {TransactionFinishScreen} from './transaction-finish';
import {TransactionAddressScreen} from './transaction-address';
import {TransactionSumScreen} from './transaction-sum';
import {createStackNavigator} from '@react-navigation/stack';
import {TransactionAccountScreen} from './transaction-account';
import {useWallets} from '../contexts/wallets';

const TransactionStack = createStackNavigator();
type TransactionScreenProp = CompositeScreenProps<any, any>;

export const TransactionScreen = ({route}: TransactionScreenProp) => {
  const wallets = useWallets();
  return (
    <TransactionStack.Navigator
      screenOptions={{header: PopupHeader}}
      initialRouteName={
        route.params.from || wallets.visible.length === 1
          ? 'transactionAddress'
          : 'transactionAccount'
      }>
      <TransactionStack.Screen
        name="transactionAddress"
        component={TransactionAddressScreen}
        initialParams={{from: wallets.visible[0].address, ...route.params}}
        options={{title: 'Address'}}
      />
      <TransactionStack.Screen
        name="transactionSum"
        component={TransactionSumScreen}
        options={{title: 'Send'}}
      />
      <TransactionStack.Screen
        name="transactionConfirmation"
        component={TransactionConfirmationScreen}
        options={{title: 'Preview'}}
      />
      <TransactionStack.Screen
        name="transactionFinish"
        component={TransactionFinishScreen}
      />
      <TransactionStack.Screen
        name="transactionAccount"
        component={TransactionAccountScreen}
      />
    </TransactionStack.Navigator>
  );
};
