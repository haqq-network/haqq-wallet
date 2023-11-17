import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
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
    wallet: Wallet;
  };
  [BackupStackRoutes.BackupCreate]: {
    wallet: Wallet;
  };
  [BackupStackRoutes.BackupVerify]: {
    wallet: Wallet;
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
  const {wallet} = useTypedRoute<HomeStackParamList, HomeStackRoutes.Backup>()
    .params;
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name={BackupStackRoutes.BackupWarning}
        component={BackupWarningScreen}
        initialParams={{wallet}}
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
