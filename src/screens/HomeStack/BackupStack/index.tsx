import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  BackupStackParamList,
  BackupStackRoutes,
  HomeStackParamList,
  HomeStackRoutes,
} from '@app/route-types';
import {BackupCreateScreen} from '@app/screens/HomeStack/BackupStack/backup-create';
import {BackupFinishScreen} from '@app/screens/HomeStack/BackupStack/backup-finish';
import {BackupVerifyScreen} from '@app/screens/HomeStack/BackupStack/backup-verify';
import {BackupWarningScreen} from '@app/screens/HomeStack/BackupStack/backup-warning';
import {ScreenOptionType} from '@app/types';

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
  const route = useTypedRoute<HomeStackParamList, HomeStackRoutes.Backup>();
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name={BackupStackRoutes.BackupWarning}
        component={themeUpdaterHOC(BackupWarningScreen)}
        initialParams={route.params}
        options={screenOptions}
      />
      <Stack.Screen
        name={BackupStackRoutes.BackupCreate}
        component={themeUpdaterHOC(BackupCreateScreen)}
      />
      <Stack.Screen
        name={BackupStackRoutes.BackupVerify}
        component={BackupVerifyScreen}
      />
      <Stack.Screen
        name={BackupStackRoutes.BackupFinish}
        component={themeUpdaterHOC(BackupFinishScreen)}
        options={screenOptions}
      />
    </Stack.Navigator>
  );
});
