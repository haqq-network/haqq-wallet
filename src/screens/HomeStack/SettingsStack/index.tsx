import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {popupScreenOptionsWithMargin} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {basicScreenOptions} from '@app/screens';
import {HomeStackParamList} from '@app/screens/HomeStack';
import {AddressBookStack} from '@app/screens/HomeStack/AddressStack';
import {ManageAccountsStack} from '@app/screens/HomeStack/ManageAccountsStack';
import {ProvidersStack} from '@app/screens/HomeStack/ProvidersStack';
import {SettingsProviderEditScreen} from '@app/screens/HomeStack/ProvidersStack/settings-provider-edit';
import {SecurityStack} from '@app/screens/HomeStack/SecurityStack';
import {HomeSettingsScreen} from '@app/screens/HomeStack/SettingsStack/home-settings';
import {SettingsAboutScreen} from '@app/screens/HomeStack/SettingsStack/settings-about';
import {SettingsNotificationScreen} from '@app/screens/HomeStack/SettingsStack/settings-notification-screen';
import {SettingsTestScreen} from '@app/screens/HomeStack/SettingsStack/settings-test';
import {SettingsThemeScreen} from '@app/screens/HomeStack/SettingsStack/settings-theme';
import {WalletConnectStack} from '@app/screens/HomeStack/WalletConnectStack';
import {BackupSssSuggestionScreen} from '@app/screens/popup-backup-sss-suggestion';

export enum SettingsStackRoutes {
  Home = 'homeSettings_',
  SettingsAccounts = 'settingsAccounts',
  SettingsAddressBook = 'settingsAddressBook',
  SettingsTheme = 'settingsTheme',
  SettingsNotification = 'settingsNotification',
  SettingsProviders = 'settingsProviders',
  SettingsAbout = 'settingsAbout',
  SettingsTest = 'settingsTest',
  SettingsSecurity = 'settingsSecurity',
  SettingsProviderForm = 'settingsProviderForm',
  WalletConnectWalletList = 'walletConnectWalletList',
  BackupSssSuggestion = 'backupSssSuggestion',
}

export type SettingsStackParamList = HomeStackParamList & {
  [SettingsStackRoutes.Home]?: {
    screen: SettingsStackRoutes.SettingsProviderForm;
    params: {
      id?: string;
      data?: Partial<Provider>;
    };
  };
  [SettingsStackRoutes.SettingsAccounts]: undefined;
  [SettingsStackRoutes.SettingsAddressBook]: undefined;
  [SettingsStackRoutes.SettingsTheme]: undefined;
  [SettingsStackRoutes.SettingsNotification]: undefined;
  [SettingsStackRoutes.SettingsProviders]: undefined;
  [SettingsStackRoutes.SettingsAbout]: undefined;
  [SettingsStackRoutes.SettingsTest]: undefined;
  [SettingsStackRoutes.SettingsSecurity]: undefined;
  [SettingsStackRoutes.SettingsProviderForm]: undefined;
  [SettingsStackRoutes.WalletConnectWalletList]: undefined;
  [SettingsStackRoutes.BackupSssSuggestion]: {accountId: string};
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsStack = memo(() => {
  return (
    <Stack.Navigator
      initialRouteName={SettingsStackRoutes.Home}
      screenOptions={basicScreenOptions}>
      <Stack.Screen
        name={SettingsStackRoutes.Home}
        component={HomeSettingsScreen}
        options={{
          ...popupScreenOptionsWithMargin,
          title: 'Settings',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name={SettingsStackRoutes.SettingsAccounts}
        component={ManageAccountsStack}
      />
      <Stack.Screen
        name={SettingsStackRoutes.SettingsAddressBook}
        component={AddressBookStack}
      />
      <Stack.Screen
        name={SettingsStackRoutes.SettingsTheme}
        component={SettingsThemeScreen}
        options={{
          ...popupScreenOptionsWithMargin,
          title: getText(I18N.settingsThemeScreen),
          headerShown: true,
        }}
      />

      <Stack.Screen
        name={SettingsStackRoutes.SettingsSecurity}
        component={SecurityStack}
      />

      <Stack.Screen
        name={SettingsStackRoutes.SettingsNotification}
        component={SettingsNotificationScreen}
        options={{
          ...popupScreenOptionsWithMargin,
          title: getText(I18N.settingsNotification),
          headerShown: true,
        }}
      />

      <Stack.Screen
        name={SettingsStackRoutes.SettingsProviders}
        component={ProvidersStack}
      />

      <Stack.Screen
        name={SettingsStackRoutes.SettingsAbout}
        component={SettingsAboutScreen}
        options={{
          ...popupScreenOptionsWithMargin,
          title: 'About',
          headerShown: true,
        }}
      />

      <Stack.Screen
        name={SettingsStackRoutes.SettingsTest}
        component={SettingsTestScreen}
        options={{
          ...popupScreenOptionsWithMargin,
          title: 'Test',
          headerShown: true,
        }}
      />

      <Stack.Screen
        name={SettingsStackRoutes.SettingsProviderForm}
        component={SettingsProviderEditScreen}
      />

      <Stack.Screen
        name={SettingsStackRoutes.WalletConnectWalletList}
        component={WalletConnectStack}
      />

      <Stack.Screen
        name={SettingsStackRoutes.BackupSssSuggestion}
        component={BackupSssSuggestionScreen}
      />
    </Stack.Navigator>
  );
});

export {SettingsStack};
