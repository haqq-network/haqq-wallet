import React, {useMemo} from 'react';

import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {observer} from 'mobx-react';
import Config from 'react-native-config';

import {hideBack} from '@app/helpers';
import {getModalScreenOptions} from '@app/helpers/get-modal-screen-options';
import {getWelcomeScreen} from '@app/helpers/get-welcome-screen';
import {themeUpdaterHOC} from '@app/helpers/theme-updater-hoc';
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

import {SignUpAgreementScreen} from './signup-agreement';

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

const WelcomeStack = observer(() => {
  const initialRouteName = useMemo(() => {
    return getWelcomeScreen();
  }, []);

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        ...basicScreenOptions,
        animation: Config.FOR_DETOX ? 'none' : 'default',
        animationDuration: Config.FOR_DETOX ? 0 : 350,
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
        name={WelcomeStackRoutes.SignUpAgreement}
        component={themeUpdaterHOC(SignUpAgreementScreen)}
        options={hideBack}
      />
      <Stack.Screen
        component={SignUpStack}
        name={WelcomeStackRoutes.SignUp}
        options={modalOptions}
      />
      <Stack.Screen
        component={SignInStack}
        name={WelcomeStackRoutes.SignIn}
        options={modalOptions}
      />
      <Stack.Screen
        component={DeviceStack}
        name={WelcomeStackRoutes.Device}
        options={modalOptions}
      />
      <Stack.Screen
        name={WelcomeStackRoutes.InAppBrowser}
        component={themeUpdaterHOC(InAppBrowserScreen)}
        options={inAppBrowserOptions}
      />
    </Stack.Navigator>
  );
});

export {WelcomeStack};
