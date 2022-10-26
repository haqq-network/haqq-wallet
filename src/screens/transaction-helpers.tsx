import React from 'react';
import {PopupHeader} from '../components/popup-header';
import {RouteProp, useRoute} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {TransactionSumAddressScreen} from './transaction-sum-address';
import {RootStackParamList} from '../types';

const TransactionStack = createStackNavigator();

export const TransactionHelperScreen = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'transactionSumAddress'>>();

  return (
    <TransactionStack.Navigator screenOptions={{header: PopupHeader}}>
      <TransactionStack.Screen
        name="transactionSumAddress"
        component={TransactionSumAddressScreen}
        initialParams={route.params}
        options={{title: 'Address'}}
      />
    </TransactionStack.Navigator>
  );
};
