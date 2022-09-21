import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {PopupHeader} from '../components/popup-header';
import {BackupCreateScreen} from './backup-create';
import {BackupFinishScreen} from './backup-finish';
import {BackupVerifyScreen} from './backup-verify';
import {BackupWarningScreen} from './backup-warning';

const BackupStack = createNativeStackNavigator();
type BackupScreenProp = CompositeScreenProps<any, any>;

export const BackupScreen = ({route}: BackupScreenProp) => {
  return (
    <BackupStack.Navigator
      screenOptions={{header: PopupHeader, title: 'Backup wallet'}}>
      <BackupStack.Screen
        name={'backupWarning'}
        component={BackupWarningScreen}
        initialParams={{address: route.params.address}}
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
        options={{
          title: '',
          headerBackHidden: true,
        }}
      />
    </BackupStack.Navigator>
  );
};
