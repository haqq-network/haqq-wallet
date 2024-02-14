import React, {memo, useCallback} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, hideHeader, popupScreenOptions} from '@app/helpers';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {I18N, getText} from '@app/i18n';
import {
  LedgerStackParamList,
  LedgerStackRoutes,
  OnboardingStackRoutes,
} from '@app/route-types';
import {LedgerAccountsScreen} from '@app/screens/DeviceStack/LedgerStack/ledger-accounts';
import {LedgerAgreementScreen} from '@app/screens/DeviceStack/LedgerStack/ledger-agreement';
import {LedgerBluetoothScreen} from '@app/screens/DeviceStack/LedgerStack/ledger-bluetooth';
import {LedgerFinishScreen} from '@app/screens/DeviceStack/LedgerStack/ledger-finish';
import {LedgerScanScreen} from '@app/screens/DeviceStack/LedgerStack/ledger-scan';
import {LedgerStoreWalletScreen} from '@app/screens/DeviceStack/LedgerStack/ledger-store-wallet';
import {LedgerVerifyScreen} from '@app/screens/DeviceStack/LedgerStack/ledger-verify';
import {OnboardingStack} from '@app/screens/WelcomeStack/OnboardingStack';
import {ScreenOptionType} from '@app/types';

const Stack = createNativeStackNavigator<LedgerStackParamList>();
const title = getText(I18N.ledgerConnect);

const screenOptionsBiometry: ScreenOptionType = {title, headerBackHidden: true};

const LedgerStack = memo(() => {
  const OnboardingStackGenerated = useCallback(
    //@ts-ignore
    props => (
      <OnboardingStack
        initialParams={{
          [OnboardingStackRoutes.OnboardingSetupPin]: {...props.route.params},
          [OnboardingStackRoutes.OnboardingRepeatPin]: {
            nextScreen: LedgerStackRoutes.LedgerStoreWallet,
          },
          [OnboardingStackRoutes.OnboardingBiometry]: {
            nextScreen: LedgerStackRoutes.LedgerStoreWallet,
          },
          [OnboardingStackRoutes.OnboardingTrackUserActivity]: {
            nextScreen: LedgerStackRoutes.LedgerStoreWallet,
          },
          [OnboardingStackRoutes.OnboardingFinish]: {},
        }}
        title={title}
      />
    ),
    [],
  );

  return (
    <Stack.Navigator screenOptions={popupScreenOptions}>
      <Stack.Screen
        name={LedgerStackRoutes.LedgerAgreement}
        component={themeUpdaterHOC(LedgerAgreementScreen)}
        options={hideBack}
      />
      <Stack.Screen
        name={LedgerStackRoutes.LedgerBluetooth}
        component={themeUpdaterHOC(LedgerBluetoothScreen)}
        options={hideBack}
      />
      <Stack.Screen
        name={LedgerStackRoutes.LedgerScan}
        component={themeUpdaterHOC(LedgerScanScreen)}
        options={{
          title,
          ...hideBack,
        }}
      />
      <Stack.Screen
        name={LedgerStackRoutes.LedgerAccounts}
        component={themeUpdaterHOC(LedgerAccountsScreen)}
        options={{title: getText(I18N.ledgerChooseAccount)}}
      />
      <Stack.Screen
        name={LedgerStackRoutes.LedgerVerify}
        component={LedgerVerifyScreen}
        options={{title: getText(I18N.ledgerVerify)}}
      />
      <Stack.Screen
        name={LedgerStackRoutes.LedgerStoreWallet}
        component={LedgerStoreWalletScreen}
        options={screenOptionsBiometry}
      />
      <Stack.Screen
        name={LedgerStackRoutes.LedgerFinish}
        component={themeUpdaterHOC(LedgerFinishScreen)}
        options={hideBack}
      />

      <Stack.Screen
        name={LedgerStackRoutes.OnboardingSetupPin}
        component={themeUpdaterHOC(OnboardingStackGenerated)}
        options={hideHeader}
      />
    </Stack.Navigator>
  );
});

export {LedgerStack};
