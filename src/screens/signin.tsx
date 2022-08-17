import React, {useMemo} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SignInAgreementScreen} from './signin-agreement';
import {SignInPinScreen} from './signin-pin';
import {PopupHeader} from '../components/popup-header';
import {SignInRepeatPinScreen} from './signin-repeat-pin';
import {CompositeScreenProps} from '@react-navigation/native';
import {SignInCreateWalletScreen} from './signin-create-wallet';
import {SignInRestoreScreen} from './signin-restore-wallet';
import {SignInFinishScreen} from './signin-finish';
import {SignInBiometryScreen} from './signin-biometry';

const SignInStack = createNativeStackNavigator();
type SignInScreenProp = CompositeScreenProps<any, any>;

export const SignInScreen = ({route}: SignInScreenProp) => {
  const title = useMemo(
    () =>
      route.params.next === 'create' ? 'Create a wallet' : 'Restore wallet',
    [route.params.next],
  );
  return (
    <SignInStack.Navigator screenOptions={{header: PopupHeader}}>
      <SignInStack.Screen
        name={'signin-agreement'}
        component={SignInAgreementScreen}
        initialParams={{next: route.params.next}}
      />
      <SignInStack.Screen
        name={'signin-pin'}
        component={SignInPinScreen}
        options={{title}}
      />
      <SignInStack.Screen
        name={'signin-repeat-pin'}
        component={SignInRepeatPinScreen}
        options={{title}}
      />
      <SignInStack.Screen
        name={'signin-biometry'}
        component={SignInBiometryScreen}
        options={{title}}
      />
      <SignInStack.Screen
        name={'signin-create-wallet'}
        component={SignInCreateWalletScreen}
        options={{title}}
      />
      <SignInStack.Screen
        name={'signin-restore-wallet'}
        component={SignInRestoreScreen}
        options={{title}}
      />
      <SignInStack.Screen
        name={'signin-finish'}
        component={SignInFinishScreen}
        options={{title}}
      />
    </SignInStack.Navigator>
  );
};
