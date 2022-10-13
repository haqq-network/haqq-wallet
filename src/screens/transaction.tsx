import React from 'react';
import {PopupHeader} from '../components/popup-header';
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
import {ScreenOptionType} from '../types';

const TransactionStack = createStackNavigator();

const screenOptions: ScreenOptionType = {title: '', headerBackHidden: true};

const screenOptionsSend: ScreenOptionType = {
  title: 'Send',
  headerBackHidden: true,
  headerRight: DismissPopupButton,
};

const screenOptionsAddress: ScreenOptionType = {
  title: 'Address',
  headerBackHidden: true,
  headerRight: DismissPopupButton,
  presentation: 'modal',
};

const screenOptionsSendFunds: ScreenOptionType = {
  title: 'Send funds from',
  headerBackHidden: true,
  headerRight: DismissPopupButton,
};

type ParamList = {
  transaction: {
    from: boolean;
  };
};

export const TransactionScreen = () => {
  const wallets = useWallets();
  const route = useRoute<RouteProp<ParamList, 'transaction'>>();

  const screenOptionsAddressRoute: ScreenOptionType = {
    title: 'Address',
    headerBackHidden: route.params.from || wallets.visible.length === 1,
    headerRight: DismissPopupButton,
  };

  const from = wallets.visible[0].address;
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
        initialParams={{from}}
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
        component={TransactionAccountScreen}
        options={screenOptionsSendFunds}
      />

      <TransactionStack.Screen
        name="transactionSumAddress"
        component={TransactionSumAddressScreen}
        options={screenOptionsAddress}
      />
    </TransactionStack.Navigator>
  );
};
