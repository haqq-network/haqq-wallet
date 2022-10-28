import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {PopupHeader} from '../components/popup-header';
import {BackupCreateScreen} from './backup-create';
import {BackupFinishScreen} from './backup-finish';
import {BackupVerifyScreen} from './backup-verify';
import {BackupWarningScreen} from './backup-warning';
import {DismissPopupButton} from '../components/dismiss-popup-button';
import {RoutePropT, ScreenOptionType} from '../types';

const BackupStack = createStackNavigator();

const screenOptions: ScreenOptionType = {
  title: '',
  headerRight: DismissPopupButton,
  headerBackHidden: true,
};

export const BackupScreen = ({route}: RoutePropT) => {
  return (
    <BackupStack.Navigator
      screenOptions={{header: PopupHeader, title: 'Backup phrase'}}>
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
