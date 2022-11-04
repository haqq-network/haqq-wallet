import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {BackupCreateScreen} from './backup-create';
import {BackupFinishScreen} from './backup-finish';
import {BackupVerifyScreen} from './backup-verify';
import {BackupWarningScreen} from './backup-warning';
import {RoutePropT, ScreenOptionType} from '../types';
import {hideBack, popupScreenOptions} from '../helpers/screenOptions';

const BackupStack = createStackNavigator();

const screenOptions: ScreenOptionType = {
  title: '',
  ...hideBack,
};

const stackScreenOptions = {
  title: 'Backup phrase',
  ...popupScreenOptions,
};

export const BackupScreen = ({route}: RoutePropT) => {
  return (
    <BackupStack.Navigator screenOptions={stackScreenOptions}>
      <BackupStack.Screen
        name={'backupWarning'}
        component={BackupWarningScreen}
        initialParams={{address: route?.params.address}}
        options={screenOptions}
      />
      <BackupStack.Screen
        name={'backupCreate'}
        component={BackupCreateScreen}
      />
      <BackupStack.Screen
        name={'backupVerify'}
        component={BackupVerifyScreen}
      />
      <BackupStack.Screen
        name={'backupFinish'}
        component={BackupFinishScreen}
        options={screenOptions}
      />
    </BackupStack.Navigator>
  );
};
