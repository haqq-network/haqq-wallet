import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {popupScreenOptionsWithMargin} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {basicScreenOptions} from '@app/screens';
import {HomeStackParamList} from '@app/screens/HomeStack';
import {SettingsAccountDetailScreen} from '@app/screens/HomeStack/ManageAccountsStack/settings-account-detail';
import {SettingsAccountEditScreen} from '@app/screens/HomeStack/ManageAccountsStack/settings-account-edit';
import {SettingsAccountStyleScreen} from '@app/screens/HomeStack/ManageAccountsStack/settings-account-style';
import {SettingsAccountsScreen} from '@app/screens/HomeStack/ManageAccountsStack/settings-accounts';
import {SettingsViewRecoveryPhraseScreen} from '@app/screens/HomeStack/ManageAccountsStack/settings-view-recovery-phrase';
import {SettingsStackParamList} from '@app/screens/HomeStack/SettingsStack';

export enum ManageAccountsStackRoutes {
  SettingsAccounts = 'settingsAccounts_',
  SettingsAccountDetail = 'settingsAccountDetail',
  SettingsAccountEdit = 'settingsAccountEdit',
  SettingsAccountStyle = 'settingsAccountStyle',
  SettingsViewRecoveryPhrase = 'settingsViewRecoveryPhrase',
}

export type ManageAccountsStackParamList = HomeStackParamList &
  SettingsStackParamList & {
    [ManageAccountsStackRoutes.SettingsAccounts]: undefined;
    [ManageAccountsStackRoutes.SettingsAccountDetail]: {
      address: string;
    };
    [ManageAccountsStackRoutes.SettingsAccountEdit]: {
      address: string;
    };
    [ManageAccountsStackRoutes.SettingsAccountStyle]: {
      address: string;
    };
    [ManageAccountsStackRoutes.SettingsViewRecoveryPhrase]: {
      accountId: string;
    };
  };

const Stack = createNativeStackNavigator<ManageAccountsStackParamList>();

const ManageAccountsStack = memo(() => {
  return (
    <Stack.Navigator
      initialRouteName={ManageAccountsStackRoutes.SettingsAccounts}
      screenOptions={basicScreenOptions}>
      <Stack.Screen
        name={ManageAccountsStackRoutes.SettingsAccounts}
        component={SettingsAccountsScreen}
        options={{
          ...popupScreenOptionsWithMargin,
          title: 'Manage accounts',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name={ManageAccountsStackRoutes.SettingsAccountDetail}
        component={SettingsAccountDetailScreen}
      />
      <Stack.Screen
        name={ManageAccountsStackRoutes.SettingsAccountEdit}
        component={SettingsAccountEditScreen}
      />
      <Stack.Screen
        name={ManageAccountsStackRoutes.SettingsAccountStyle}
        component={SettingsAccountStyleScreen}
        options={{
          ...popupScreenOptionsWithMargin,
          title: 'Change style',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name={ManageAccountsStackRoutes.SettingsViewRecoveryPhrase}
        component={SettingsViewRecoveryPhraseScreen}
        options={{
          ...popupScreenOptionsWithMargin,
          title: getText(I18N.settingsViewRecoveryPhraseTitle),
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
});

export {ManageAccountsStack};
