import React, {memo} from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';
import {BackupCreateScreen} from '@app/screens/HomeStack/BackupStack/backup-create';
import {BackupFinishScreen} from '@app/screens/HomeStack/BackupStack/backup-finish';
import {BackupVerifyScreen} from '@app/screens/HomeStack/BackupStack/backup-verify';
import {BackupWarningScreen} from '@app/screens/HomeStack/BackupStack/backup-warning';
import {ScreenOptionType} from '@app/types';

const Stack = createStackNavigator();

const screenOptions: ScreenOptionType = {
  title: '',
  ...hideBack,
};

const stackScreenOptions = {
  title: getText(I18N.backupCreateVerifyTitle),
  ...popupScreenOptions,
};

export const BackupStack = memo(() => {
  const {accountId} = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.Backup
  >().params;
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="backupWarning"
        component={BackupWarningScreen}
        initialParams={{accountId: accountId}}
        options={screenOptions}
      />
      <Stack.Screen name="backupCreate" component={BackupCreateScreen} />
      <Stack.Screen name="backupVerify" component={BackupVerifyScreen} />
      <Stack.Screen
        name="backupFinish"
        component={BackupFinishScreen}
        options={screenOptions}
      />
    </Stack.Navigator>
  );
});
