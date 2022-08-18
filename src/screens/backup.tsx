import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {PopupHeader} from '../components/popup-header';
import {BackupCreateScreen} from './backup-create';
import {BackupFinishScreen} from './backup-finish';
import {BackupVerifyScreen} from './backup-verify';

const BackupStack = createNativeStackNavigator();
type BackupScreenProp = CompositeScreenProps<any, any>;

export const BackupScreen = ({route}: BackupScreenProp) => {
  return (
    <BackupStack.Navigator
      screenOptions={{header: PopupHeader, title: 'Backup wallet'}}>
      <BackupStack.Screen
        name={'backupCreate'}
        component={BackupCreateScreen}
        initialParams={{address: route.params.address}}
      />
      <BackupStack.Screen
        name={'backupVerify'}
        component={BackupVerifyScreen}
      />
      <BackupStack.Screen
        name={'backupFinish'}
        component={BackupFinishScreen}
      />
    </BackupStack.Navigator>
  );
};
