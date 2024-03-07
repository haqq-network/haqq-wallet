import React, {memo, useMemo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {hideBack, popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks/use-typed-route';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {
  HomeStackParamList,
  HomeStackRoutes,
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
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
import {TransactionSelectCryptoScreen} from '@app/screens/transaction-select-crypto';
import {ScreenOptionType} from '@app/types';

const Stack = createNativeStackNavigator<TransactionStackParamList>();

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

const screenOptionsSelectCrypto: ScreenOptionType = {
  title: getText(I18N.transactionSelectCryptoTitle),
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

  const initialRoute = useMemo(() => {
    const condition = nft || from || Wallet.getAllVisible().length === 1;
    return condition
      ? TransactionStackRoutes.TransactionAddress
      : TransactionStackRoutes.TransactionAccount;
  }, [nft, from]);

  return (
    <Stack.Navigator
      screenOptions={popupScreenOptions}
      initialRouteName={initialRoute}>
      <Stack.Screen
        name={TransactionStackRoutes.TransactionAddress}
        component={TransactionAddressScreen}
        initialParams={{from, to, nft}}
        options={screenOptionsAddressRoute}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionSum}
        component={TransactionSumScreen}
        options={screenOptionsSend}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionSelectCrypto}
        component={TransactionSelectCryptoScreen}
        options={screenOptionsSelectCrypto}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionConfirmation}
        component={TransactionConfirmationScreen}
        options={screenOptionsConfirmation}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionNftConfirmation}
        component={TransactionNftConfirmationScreen}
        options={screenOptionsConfirmation}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionFinish}
        component={TransactionFinishScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionNftFinish}
        component={TransactionNftFinishScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionAccount}
        initialParams={{to}}
        component={TransactionAccountScreen}
        options={screenOptionsSendFunds}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionLedger}
        component={TransactionLedgerScreen}
        options={screenOptionsLedger}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionSumAddress}
        component={TransactionSumAddressScreen}
        options={screenOptionsAddress}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionContactEdit}
        component={TransactionContactEditScreen}
        options={screenOptionsEditContact}
      />
    </Stack.Navigator>
  );
});
