import React, {memo} from 'react';

import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {popupScreenOptions} from '@app/helpers';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {basicScreenOptions} from '@app/screens';
import {NewsDetailScreen} from '@app/screens/HomeStack/HomeNewsStack/news-detail';
import {WelcomeScreen} from '@app/screens/welcome';
import {WelcomeNewsScreen} from '@app/screens/welcome-news';
import {SignInStack} from '@app/screens/WelcomeStack/SignInStack';
import {
  SignUpStack,
  SignUpStackParamList,
  SignUpStackRoutes,
} from '@app/screens/WelcomeStack/SignUpStack';
import {AdjustEvents} from '@app/types';

import {DeviceStack} from '../DeviceStack';
import {
  HomeStackParamList,
  HomeStackRoutes,
  inAppBrowserOptions,
} from '../HomeStack';
import {InAppBrowserScreen} from '../HomeStack/in-app-browser';

export enum WelcomeStackRoutes {
  Welcome = 'welcome',
  WelcomeNews = 'welcomeNews',
  SignUp = 'signup',
  Device = 'device',
  SignIn = 'signin',
  NewsDetail = 'newsDetail',
  InAppBrowser = 'inAppBrowser',
}

export type WelcomeStackParamList = {
  [WelcomeStackRoutes.Welcome]: undefined;
  [WelcomeStackRoutes.WelcomeNews]: undefined;
  [WelcomeStackRoutes.SignUp]?: {
    screen: SignUpStackRoutes.SignupStoreWallet;
    params: SignUpStackParamList[SignUpStackRoutes.SignupStoreWallet];
  };
  [WelcomeStackRoutes.Device]: undefined;
  [WelcomeStackRoutes.SignIn]: undefined;
  [WelcomeStackRoutes.NewsDetail]: {
    id: string;
    openEvent: AdjustEvents;
    linkEvent: AdjustEvents;
    scrollEvent: AdjustEvents;
  };
  [WelcomeStackRoutes.InAppBrowser]: HomeStackParamList[HomeStackRoutes.InAppBrowser];
};

const Stack = createNativeStackNavigator<WelcomeStackParamList>();

const modalOptions: NativeStackNavigationOptions = {
  presentation: 'modal',
  gestureEnabled: true,
  gestureDirection: 'vertical',
};

const newsDetailOptions = {
  ...popupScreenOptions,
  ...modalOptions,
  headerShown: true,
};

type Props = {
  initialRouteName: WelcomeStackRoutes.Welcome | WelcomeStackRoutes.WelcomeNews;
};

const WelcomeStack = memo(({initialRouteName}: Props) => {
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
        options={newsDetailOptions}
      />
      <Stack.Screen
        component={themeUpdaterHOC(SignUpStack)}
        name={WelcomeStackRoutes.SignUp}
        options={modalOptions}
      />
      <Stack.Screen
        component={themeUpdaterHOC(DeviceStack)}
        name={WelcomeStackRoutes.Device}
        options={modalOptions}
      />
      <Stack.Screen
        component={themeUpdaterHOC(SignInStack)}
        name={WelcomeStackRoutes.SignIn}
        options={modalOptions}
      />
      <Stack.Screen
        name={WelcomeStackRoutes.InAppBrowser}
        component={themeUpdaterHOC(InAppBrowserScreen)}
        options={{
          ...inAppBrowserOptions,
          presentation: 'fullScreenModal',
        }}
      />
    </Stack.Navigator>
  );
});

export {WelcomeStack};
