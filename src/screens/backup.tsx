import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {hideBack, popupScreenOptions} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {BackupCreateScreen} from '@app/screens/backup-create';
import {BackupFinishScreen} from '@app/screens/backup-finish';
import {BackupVerifyScreen} from '@app/screens/backup-verify';
import {BackupWarningScreen} from '@app/screens/backup-warning';
import {RoutePropT, ScreenOptionType} from '@app/types';

const BackupStack = createStackNavigator();

const screenOptions: ScreenOptionType = {
  title: '',
  ...hideBack,
};

const stackScreenOptions = {
  title: getText(I18N.backupCreateVerifyTitle),
  ...popupScreenOptions,
};

export const BackupScreen = ({route}: RoutePropT) => {
  return (
    <BackupStack.Navigator screenOptions={stackScreenOptions}>
      <BackupStack.Screen
        name="backupWarning"
        component={BackupWarningScreen}
        initialParams={{accountId: route?.params.accountId}}
        options={screenOptions}
      />
      <BackupStack.Screen name="backupCreate" component={BackupCreateScreen} />
      <BackupStack.Screen name="backupVerify" component={BackupVerifyScreen} />
      <BackupStack.Screen
        name="backupFinish"
        component={BackupFinishScreen}
        options={screenOptions}
      />
    </BackupStack.Navigator>
  );
};
