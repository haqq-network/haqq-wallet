import React, {memo} from 'react';

import {FOR_DETOX} from '@env';
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {getModalScreenOptions} from '@app/helpers/get-modal-screen-options';
import {WelcomeStackParamList, WelcomeStackRoutes} from '@app/route-types';
import {basicScreenOptions} from '@app/screens';
import {DeviceStack} from '@app/screens/DeviceStack';
import {inAppBrowserOptions} from '@app/screens/HomeStack';
import {NewsDetailScreen} from '@app/screens/HomeStack/HomeNewsStack/news-detail';
import {InAppBrowserScreen} from '@app/screens/HomeStack/in-app-browser';
import {WelcomeScreen} from '@app/screens/welcome';
import {WelcomeNewsScreen} from '@app/screens/welcome-news';
import {SignInStack} from '@app/screens/WelcomeStack/SignInStack';
import {SignUpStack} from '@app/screens/WelcomeStack/SignUpStack';

const Stack = createNativeStackNavigator<WelcomeStackParamList>();

const modalOptions: NativeStackNavigationOptions = {
  presentation: 'modal',
  gestureEnabled: true,
  gestureDirection: 'vertical',
  animation: 'slide_from_bottom',
};

const newsDetailOptions: NativeStackNavigationOptions = {
  ...getModalScreenOptions(),
  ...modalOptions,
};

type Props = {
  initialRouteName: WelcomeStackRoutes.Welcome | WelcomeStackRoutes.WelcomeNews;
};

const WelcomeStack = memo(({initialRouteName}: Props) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        ...basicScreenOptions,
        animation: FOR_DETOX ? 'none' : 'default',
        animationDuration: FOR_DETOX ? 0 : 350,
      }}>
      <Stack.Screen
        component={WelcomeScreen}
        name={WelcomeStackRoutes.Welcome}
      />
      <Stack.Screen
        component={WelcomeNewsScreen}
        name={WelcomeStackRoutes.WelcomeNews}
      />
      <Stack.Screen
        component={NewsDetailScreen}
        name={WelcomeStackRoutes.NewsDetail}
        options={newsDetailOptions}
      />
      <Stack.Screen
        component={SignUpStack}
        name={WelcomeStackRoutes.SignUp}
        options={modalOptions}
      />
      <Stack.Screen
        component={DeviceStack}
        name={WelcomeStackRoutes.Device}
        options={modalOptions}
      />
      <Stack.Screen
        component={SignInStack}
        name={WelcomeStackRoutes.SignIn}
        options={modalOptions}
      />
      <Stack.Screen
        name={WelcomeStackRoutes.InAppBrowser}
        component={InAppBrowserScreen}
        options={inAppBrowserOptions}
      />
    </Stack.Navigator>
  );
});

export {WelcomeStack};
