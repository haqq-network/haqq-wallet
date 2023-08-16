import React, {memo, useMemo} from 'react';

import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {basicScreenOptions} from '@app/screens';
import {NewsDetailScreen} from '@app/screens/HomeStack/HomeNewsStack/news-detail';
import {ModalState, ModalsScreenConnected} from '@app/screens/modals-screen';
import {WelcomeScreen} from '@app/screens/welcome';
import {WelcomeNewsScreen} from '@app/screens/welcome-news';
import {LedgerStack} from '@app/screens/WelcomeStack/LedgerStack';
import {SignInStack} from '@app/screens/WelcomeStack/SignInStack';
import {SignUpStack} from '@app/screens/WelcomeStack/SignUpStack';

export enum WelcomeStackRoutes {
  Welcome = 'welcome',
  WelcomeNews = 'welcomeNews',
  SignUp = 'signup',
  Ledger = 'ledger',
  SignIn = 'signin',
  Modal = 'modal',
  NewsDetail = 'newsDetail',
}

export type WelcomeStackParamList = {
  [WelcomeStackRoutes.Welcome]: undefined;
  [WelcomeStackRoutes.WelcomeNews]: undefined;
  [WelcomeStackRoutes.SignUp]: undefined;
  [WelcomeStackRoutes.Ledger]: undefined;
  [WelcomeStackRoutes.SignIn]: undefined;
  [WelcomeStackRoutes.Modal]: ModalState;
  [WelcomeStackRoutes.NewsDetail]: {id: string};
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
        ? WelcomeStackRoutes.WelcomeNews
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
        name={WelcomeStackRoutes.WelcomeNews}
      />
      <Stack.Screen
        component={themeUpdaterHOC(NewsDetailScreen)}
        name={WelcomeStackRoutes.NewsDetail}
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
