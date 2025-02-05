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
import {TransactionContactEditScreen} from '@app/screens/HomeStack/TransactionStack/transaction-contact-edit';
import {TransactionNftConfirmationScreen} from '@app/screens/HomeStack/TransactionStack/transaction-nft-confirmation';
import {TransactionNftFinishScreen} from '@app/screens/HomeStack/TransactionStack/transaction-nft-finish';
import {TransactionSumAddressScreen} from '@app/screens/HomeStack/TransactionStack/transaction-sum-address';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ScreenOptionType, WalletType} from '@app/types';

import {FeeSettingsScreen} from './fee-settings';
import {TransactionAmountScreen} from './transaction-amount';
import {TransactionNetworkSelectScreen} from './transaction-network-select';
import {TransactionPreviewScreen} from './transaction-preview';
import {TransactionResultScreen} from './transaction-result';
import {TransactionSelectCryptoScreen} from './transaction-select-crypto';
import {TransactionStoreContainer} from './transaction-store';

const Stack = createNativeStackNavigator<TransactionStackParamList>();

const screenOptions: ScreenOptionType = {title: '', headerBackHidden: true};

export const TransactionStack = memo(() => {
  const {params} = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.Transaction
  >();
  // FIXME: For some reason when navigate from stack to stack params stored inside params like params.params
  //@ts-ignore
  const initialParams = params?.params ?? params;
  const {from, to, nft} = initialParams;

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
    <TransactionStoreContainer initialParams={initialParams}>
      <Stack.Navigator
        screenOptions={popupScreenOptions}
        initialRouteName={initialRoute}>
        <Stack.Screen
          name={TransactionStackRoutes.TransactionAddress}
          component={themeUpdaterHOC(TransactionAddressScreen)}
          initialParams={params}
          options={screenOptionsAddressRoute}
        />
        <Stack.Screen
          name={TransactionStackRoutes.TransactionNetworkSelect}
          component={themeUpdaterHOC(TransactionNetworkSelectScreen)}
          options={{
            title: getText(I18N.addressNetwork),
            headerRight: DismissPopupButton,
          }}
        />
        <Stack.Screen
          name={TransactionStackRoutes.TransactionSelectCrypto}
          component={themeUpdaterHOC(TransactionSelectCryptoScreen)}
          options={{
            title: getText(I18N.selectCryptoToSend),
            headerRight: DismissPopupButton,
          }}
        />
        <Stack.Screen
          name={TransactionStackRoutes.TransactionAmount}
          component={themeUpdaterHOC(TransactionAmountScreen)}
          options={{
            title: getText(I18N.transactionSumSendTitle),
            ...hideBack,
          }}
        />
        <Stack.Screen
          name={TransactionStackRoutes.TransactionPreview}
          component={themeUpdaterHOC(TransactionPreviewScreen)}
          options={{
            title: getText(I18N.transactionConfirmationPreviewTitle),
          }}
        />
        <Stack.Screen
          name={TransactionStackRoutes.TransactionFeeSettings}
          component={themeUpdaterHOC(FeeSettingsScreen)}
        />
        <Stack.Screen
          name={TransactionStackRoutes.TransactionResult}
          component={themeUpdaterHOC(TransactionResultScreen)}
          options={screenOptions}
        />
        <Stack.Screen
          name={TransactionStackRoutes.TransactionNftConfirmation}
          component={themeUpdaterHOC(TransactionNftConfirmationScreen)}
          options={{
            title: getText(I18N.transactionConfirmationPreviewTitle),
          }}
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
    </TransactionStoreContainer>
  );
});
