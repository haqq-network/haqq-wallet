import React, {memo, useMemo} from 'react';

import {createNavigationContainerRef} from '@react-navigation/native';
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {basicScreenOptions} from '@app/screens';
import {ModalState, ModalsScreenConnected} from '@app/screens/modals-screen';
import {WelcomeScreen} from '@app/screens/welcome';
import {WelcomeNewsScreen} from '@app/screens/welcome-news';
import {LedgerStack} from '@app/screens/WelcomeStack/LedgerStack';
import {SignInStack} from '@app/screens/WelcomeStack/SignInStack';
import {SignUpStack} from '@app/screens/WelcomeStack/SignUpStack';

export enum WelcomeStackRoutes {
  Welcome = 'welcome',
  WelcomNews = 'welcomeNews',
  SignUp = 'signup',
  Ledger = 'ledger',
  SignIn = 'signin',
  Modal = 'modal',
}

export type WelcomeStackParamList = {
  [WelcomeStackRoutes.Welcome]: undefined;
  [WelcomeStackRoutes.WelcomNews]: undefined;
  [WelcomeStackRoutes.SignUp]: undefined;
  [WelcomeStackRoutes.Ledger]: undefined;
  [WelcomeStackRoutes.SignIn]: undefined;
  [WelcomeStackRoutes.Modal]: ModalState;
};

const Stack = createNativeStackNavigator<WelcomeStackParamList>();

const modalOptions: NativeStackNavigationOptions = {
  presentation: 'modal',
};

type Props = {
  isWelcomeNewsEnabled: boolean;
};
const WelcomeStack = memo(({isWelcomeNewsEnabled}: Props) => {
  const initialRouteName = useMemo(
    () =>
      isWelcomeNewsEnabled
        ? WelcomeStackRoutes.WelcomNews
        : WelcomeStackRoutes.Welcome,
    [isWelcomeNewsEnabled],
  );

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={basicScreenOptions}>
      <Stack.Screen
        component={themeUpdaterHOC(WelcomeScreen)}
        name={WelcomeStackRoutes.Welcome}
      />
      <Stack.Screen
        component={themeUpdaterHOC(WelcomeNewsScreen)}
        name={WelcomeStackRoutes.WelcomNews}
      />
      <Stack.Screen
        component={themeUpdaterHOC(SignUpStack)}
        name={WelcomeStackRoutes.SignUp}
        options={modalOptions}
      />
      <Stack.Screen
        component={themeUpdaterHOC(LedgerStack)}
        name={WelcomeStackRoutes.Ledger}
        options={modalOptions}
      />
      <Stack.Screen
        component={themeUpdaterHOC(SignInStack)}
        name={WelcomeStackRoutes.SignIn}
        options={modalOptions}
      />

      <Stack.Screen
        component={themeUpdaterHOC(ModalsScreenConnected)}
        name={WelcomeStackRoutes.Modal}
        options={{presentation: 'fullScreenModal', animation: 'fade'}}
      />
    </Stack.Navigator>
  );
});

export {WelcomeStack};
