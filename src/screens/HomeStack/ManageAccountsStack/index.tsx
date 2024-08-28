import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {popupScreenOptionsWithMargin} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {
  ManageAccountsStackParamList,
  ManageAccountsStackRoutes,
} from '@app/route-types';
import {basicScreenOptions} from '@app/screens';
import {SettingsAccountDetailScreen} from '@app/screens/HomeStack/ManageAccountsStack/settings-account-detail';
import {SettingsAccountEditScreen} from '@app/screens/HomeStack/ManageAccountsStack/settings-account-edit';
import {SettingsAccountStyleScreen} from '@app/screens/HomeStack/ManageAccountsStack/settings-account-style';
import {SettingsAccountsScreen} from '@app/screens/HomeStack/ManageAccountsStack/settings-accounts';
import {SettingsViewRecoveryPhraseScreen} from '@app/screens/HomeStack/ManageAccountsStack/settings-view-recovery-phrase';

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
          title: getText(I18N.homeSettingsAccounts),
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
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ManageAccountsStackRoutes.SettingsViewRecoveryPhrase}
        component={SettingsViewRecoveryPhraseScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
});

export {ManageAccountsStack};
