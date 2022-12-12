import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {DismissPopupButton} from '@app/components/dismiss-popup-button';
import {hideBack, popupScreenOptions} from '@app/helpers';
import {useWallets} from '@app/hooks';
import {useTypedRoute} from '@app/hooks/use-typed-route';
import {I18N, getText} from '@app/i18n';
import {TransactionAccountScreen} from '@app/screens/transaction-account';
import {TransactionAddressScreen} from '@app/screens/transaction-address';
import {TransactionConfirmationScreen} from '@app/screens/transaction-confirmation';
import {TransactionContactEditScreen} from '@app/screens/transaction-contact-edit';
import {TransactionFinishScreen} from '@app/screens/transaction-finish';
import {TransactionLedgerScreen} from '@app/screens/transaction-ledger';
import {TransactionSumScreen} from '@app/screens/transaction-sum';
import {TransactionSumAddressScreen} from '@app/screens/transaction-sum-address';
import {ScreenOptionType} from '@app/types';

const TransactionStack = createStackNavigator();

const screenOptions: ScreenOptionType = {title: '', headerBackHidden: true};

const screenOptionsSend: ScreenOptionType = {
  title: getText(I18N.transactionSumSendTitle),
  ...hideBack,
};

const screenOptionsAddress: ScreenOptionType = {
  title: getText(I18N.transactionSumAddressTitle),
};

const screenOptionsSendFunds: ScreenOptionType = {
  title: getText(I18N.transactionAccountSendFundsTitle),
  ...hideBack,
};

const screenOptionsEditContact: ScreenOptionType = {
  title: getText(I18N.transactionContactEditHeaderTitle),
  headerRight: DismissPopupButton,
};

const screenOptionsLedger: ScreenOptionType = {
  title: getText(I18N.transactionLedgerConfirmationTitle),
};
const screenOptionsConfirmation: ScreenOptionType = {
  title: getText(I18N.transactionConfirmationPreviewTitle),
};

export const TransactionScreen = () => {
  const wallets = useWallets();
  const {
    params: {from, to},
  } = useTypedRoute<'transaction'>();

  const screenOptionsAddressRoute: ScreenOptionType = {
    title: getText(I18N.transactionSumAddressTitle),
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
        options={screenOptionsConfirmation}
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
        options={screenOptionsLedger}
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
