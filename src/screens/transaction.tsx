import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {PopupHeader} from '../components/popup-header';
import {CompositeScreenProps} from '@react-navigation/native';
import {TransactionConfirmationScreen} from './transaction-confirmation';
import {TransactionFinishScreen} from './transaction-finish';
import {TransactionAddressScreen} from './transaction-address';
import {TransactionSumScreen} from './transaction-sum';

const TransactionStack = createNativeStackNavigator();
type TransactionScreenProp = CompositeScreenProps<any, any>;

export const TransactionScreen = ({route}: TransactionScreenProp) => {
  return (
    <TransactionStack.Navigator screenOptions={{header: PopupHeader}}>
      <TransactionStack.Screen
        name="transactionAddress"
        component={TransactionAddressScreen}
        initialParams={route.params ?? {}}
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
    </TransactionStack.Navigator>
  );
};
