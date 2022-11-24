import React from 'react';

import {RouteProp, useRoute} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {DismissPopupButton} from '@app/components/dismiss-popup-button';
import {hideBack, popupScreenOptions} from '@app/helpers';
import {useWallets} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {RootStackParamList, ScreenOptionType} from '@app/types';

import {TransactionAccountScreen} from './transaction-account';
import {TransactionAddressScreen} from './transaction-address';
import {TransactionConfirmationScreen} from './transaction-confirmation';
import {TransactionContactEditScreen} from './transaction-contact-edit';
import {TransactionFinishScreen} from './transaction-finish';
import {TransactionLedgerScreen} from './transaction-ledger';
import {TransactionSumScreen} from './transaction-sum';
import {TransactionSumAddressScreen} from './transaction-sum-address';

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
  title: getText(I18N.transactionContactEditHeaderTitle),
  headerRight: DismissPopupButton,
};

export const TransactionScreen = () => {
  const wallets = useWallets();
  const {
    params: {from, to},
  } = useRoute<RouteProp<RootStackParamList, 'transaction'>>();

  const screenOptionsAddressRoute: ScreenOptionType = {
    title: 'Address',
    headerBackHidden: from || wallets.visible.length === 1,
    headerRight: DismissPopupButton,
  };

  return (
    <TransactionStack.Navigator
      screenOptions={{...popupScreenOptions, keyboardHandlingEnabled: false}}
      initialRouteName={
        from || wallets.visible.length === 1
          ? 'transactionAddress'
          : 'transactionAccount'
      }>
      <TransactionStack.Screen
        name="transactionAddress"
        component={TransactionAddressScreen}
        initialParams={{from, to}}
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
        initialParams={{to}}
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
        name="transactionContactEdit"
        component={TransactionContactEditScreen}
        options={screenOptionsEditContact}
      />
    </TransactionStack.Navigator>
  );
};
