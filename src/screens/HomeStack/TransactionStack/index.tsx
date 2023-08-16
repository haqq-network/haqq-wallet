import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {hideBack, popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks/use-typed-route';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';
import {TransactionAccountScreen} from '@app/screens/HomeStack/TransactionStack/transaction-account';
import {TransactionAddressScreen} from '@app/screens/HomeStack/TransactionStack/transaction-address';
import {TransactionConfirmationScreen} from '@app/screens/HomeStack/TransactionStack/transaction-confirmation';
import {TransactionContactEditScreen} from '@app/screens/HomeStack/TransactionStack/transaction-contact-edit';
import {TransactionFinishScreen} from '@app/screens/HomeStack/TransactionStack/transaction-finish';
import {TransactionLedgerScreen} from '@app/screens/HomeStack/TransactionStack/transaction-ledger';
import {TransactionNftConfirmationScreen} from '@app/screens/HomeStack/TransactionStack/transaction-nft-confirmation';
import {TransactionNftFinishScreen} from '@app/screens/HomeStack/TransactionStack/transaction-nft-finish';
import {TransactionSumScreen} from '@app/screens/HomeStack/TransactionStack/transaction-sum';
import {TransactionSumAddressScreen} from '@app/screens/HomeStack/TransactionStack/transaction-sum-address';
import {ScreenOptionType} from '@app/types';

const Stack = createNativeStackNavigator();

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

export const TransactionStack = memo(() => {
  const {
    params: {from, to, nft},
  } = useTypedRoute<HomeStackParamList, HomeStackRoutes.Transaction>();

  const screenOptionsAddressRoute: ScreenOptionType = {
    title: getText(I18N.transactionSumAddressTitle),
    headerBackHidden: from || Wallet.getAllVisible().length === 1,
    headerRight: DismissPopupButton,
  };

  return (
    <Stack.Navigator
      screenOptions={{...popupScreenOptions, keyboardHandlingEnabled: false}}
      initialRouteName={
        nft || from || Wallet.getAllVisible().length === 1
          ? 'transactionAddress'
          : 'transactionAccount'
      }>
      <Stack.Screen
        name="transactionAddress"
        component={TransactionAddressScreen}
        initialParams={{from, to, nft}}
        options={screenOptionsAddressRoute}
      />
      <Stack.Screen
        name="transactionSum"
        component={TransactionSumScreen}
        options={screenOptionsSend}
      />
      <Stack.Screen
        name="transactionConfirmation"
        component={TransactionConfirmationScreen}
        options={screenOptionsConfirmation}
      />
      <Stack.Screen
        name="transactionNftConfirmation"
        component={TransactionNftConfirmationScreen}
        options={screenOptionsConfirmation}
      />
      <Stack.Screen
        name="transactionFinish"
        component={TransactionFinishScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="transactionNftFinish"
        component={TransactionNftFinishScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="transactionAccount"
        initialParams={{to}}
        component={TransactionAccountScreen}
        options={screenOptionsSendFunds}
      />
      <Stack.Screen
        name="transactionLedger"
        component={TransactionLedgerScreen}
        options={screenOptionsLedger}
      />
      <Stack.Screen
        name="transactionSumAddress"
        component={TransactionSumAddressScreen}
        options={screenOptionsAddress}
      />
      <Stack.Screen
        name="transactionContactEdit"
        component={TransactionContactEditScreen}
        options={screenOptionsEditContact}
      />
    </Stack.Navigator>
  );
});
