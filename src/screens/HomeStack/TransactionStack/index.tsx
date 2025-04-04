import React, {memo, useEffect, useMemo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {hideBack, popupScreenOptions} from '@app/helpers';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {useTypedRoute} from '@app/hooks/use-typed-route';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
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
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ScreenOptionType, WalletType} from '@app/types';

const Stack = createNativeStackNavigator<TransactionStackParamList>();

const screenOptions: ScreenOptionType = {title: '', headerBackHidden: true};

export const TransactionStack = memo(() => {
  const {
    params: {from, to, nft},
  } = useTypedRoute<HomeStackParamList, HomeStackRoutes.Transaction>();

  const screenOptionsAddressRoute: ScreenOptionType = {
    title: getText(I18N.transactionSumAddressTitle),
    headerBackHidden: from || Wallet.getAllVisible().length === 1,
    headerRight: DismissPopupButton,
  };

  useEffect(() => {
    const w = Wallet.getById(from);
    if (w?.type === WalletType.watchOnly) {
      vibrate(HapticEffects.error);
      navigator.goBack();
    }
  }, [from]);

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
        component={themeUpdaterHOC(TransactionAddressScreen)}
        initialParams={{from, to, nft}}
        options={screenOptionsAddressRoute}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionSum}
        component={themeUpdaterHOC(TransactionSumScreen)}
        options={{
          title: getText(I18N.transactionSumSendTitle),
          ...hideBack,
        }}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionSelectCrypto}
        component={themeUpdaterHOC(TransactionSelectCryptoScreen)}
        options={{
          title: getText(I18N.transactionSelectCryptoTitle),
        }}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionConfirmation}
        component={themeUpdaterHOC(TransactionConfirmationScreen)}
        options={{
          title: getText(I18N.transactionConfirmationPreviewTitle),
        }}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionNftConfirmation}
        component={themeUpdaterHOC(TransactionNftConfirmationScreen)}
        options={{
          title: getText(I18N.transactionConfirmationPreviewTitle),
        }}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionFinish}
        component={themeUpdaterHOC(TransactionFinishScreen)}
        options={screenOptions}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionNftFinish}
        component={themeUpdaterHOC(TransactionNftFinishScreen)}
        options={screenOptions}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionAccount}
        initialParams={{to}}
        component={themeUpdaterHOC(TransactionAccountScreen)}
        options={{
          title: getText(I18N.transactionAccountSendFundsTitle),
          ...hideBack,
        }}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionLedger}
        component={themeUpdaterHOC(TransactionLedgerScreen)}
        options={{
          title: getText(I18N.transactionLedgerConfirmationTitle),
        }}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionSumAddress}
        component={themeUpdaterHOC(TransactionSumAddressScreen)}
        options={{
          title: getText(I18N.transactionSumAddressTitle),
        }}
      />
      <Stack.Screen
        name={TransactionStackRoutes.TransactionContactEdit}
        component={themeUpdaterHOC(TransactionContactEditScreen)}
        options={{
          title: getText(I18N.transactionContactEditHeaderTitle),
          headerRight: DismissPopupButton,
        }}
      />
    </Stack.Navigator>
  );
});
