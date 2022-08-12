import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Header} from '../components/header';
import {CompositeScreenProps} from '@react-navigation/native';
import {TransactionFormScreen} from './transaction-form';
import {TransactionConfirmationScreen} from './transaction-confirmation';
import {TransactionFinishScreen} from './transaction-finish';

const TransactionStack = createNativeStackNavigator();
type TransactionScreenProp = CompositeScreenProps<any, any>;

export const TransactionScreen = ({route}: TransactionScreenProp) => {
  return (
    <TransactionStack.Navigator screenOptions={{header: Header}}>
      <TransactionStack.Screen
        name={'transaction-form'}
        component={TransactionFormScreen}
        initialParams={route.params ?? {}}
      />
      <TransactionStack.Screen
        name={'transaction-confirmation'}
        component={TransactionConfirmationScreen}
      />
      <TransactionStack.Screen
        name={'transaction-finish'}
        component={TransactionFinishScreen}
      />
    </TransactionStack.Navigator>
  );
};
