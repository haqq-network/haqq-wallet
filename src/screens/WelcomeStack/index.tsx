import React, {memo} from 'react';

import {FOR_DETOX} from '@env';
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {popupScreenOptions} from '@app/helpers';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
import {WelcomeStackParamList, WelcomeStackRoutes} from '@app/route-types';
import {basicScreenOptions} from '@app/screens';
import {NewsDetailScreen} from '@app/screens/HomeStack/HomeNewsStack/news-detail';
import {WelcomeScreen} from '@app/screens/welcome';
import {WelcomeNewsScreen} from '@app/screens/welcome-news';
import {LedgerStack} from '@app/screens/WelcomeStack/LedgerStack';
import {SignInStack} from '@app/screens/WelcomeStack/SignInStack';
import {SignUpStack} from '@app/screens/WelcomeStack/SignUpStack';

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
      screenOptions={{
        ...basicScreenOptions,
        animation: FOR_DETOX ? 'none' : 'default',
      }}>
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
        component={themeUpdaterHOC(LedgerStack)}
        name={WelcomeStackRoutes.Ledger}
        options={modalOptions}
      />
      <Stack.Screen
        component={themeUpdaterHOC(SignInStack)}
        name={WelcomeStackRoutes.SignIn}
        options={modalOptions}
      />
    </Stack.Navigator>
  );
});

export {WelcomeStack};
