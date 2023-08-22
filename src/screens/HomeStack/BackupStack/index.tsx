import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';
import {BackupCreateScreen} from '@app/screens/HomeStack/BackupStack/backup-create';
import {BackupFinishScreen} from '@app/screens/HomeStack/BackupStack/backup-finish';
import {BackupVerifyScreen} from '@app/screens/HomeStack/BackupStack/backup-verify';
import {BackupWarningScreen} from '@app/screens/HomeStack/BackupStack/backup-warning';
import {ScreenOptionType} from '@app/types';

export enum BackupStackRoutes {
  BackupWarning = 'backupWarning',
  BackupCreate = 'backupCreate',
  BackupVerify = 'backupVerify',
  BackupFinish = 'backupFinish',
}

export type BackupStackParamList = HomeStackParamList & {
  [BackupStackRoutes.BackupWarning]: {
    accountId: string;
  };
  [BackupStackRoutes.BackupCreate]: {
    accountId: string;
  };
  [BackupStackRoutes.BackupVerify]: {
    accountId: string;
  };
  [BackupStackRoutes.BackupFinish]: undefined;
};

const Stack = createNativeStackNavigator<BackupStackParamList>();

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
        name={BackupStackRoutes.BackupWarning}
        component={BackupWarningScreen}
        initialParams={{accountId: accountId}}
        options={screenOptions}
      />
      <Stack.Screen
        name={BackupStackRoutes.BackupCreate}
        component={BackupCreateScreen}
      />
      <Stack.Screen
        name={BackupStackRoutes.BackupVerify}
        component={BackupVerifyScreen}
      />
      <Stack.Screen
        name={BackupStackRoutes.BackupFinish}
        component={BackupFinishScreen}
        options={screenOptions}
      />
    </Stack.Navigator>
  );
});
