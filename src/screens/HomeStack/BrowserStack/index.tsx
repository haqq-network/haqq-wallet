import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {HomeStackParamList} from '@app/screens/HomeStack';
import {BrowserEditBookmarksScreen} from '@app/screens/HomeStack/BrowserStack/browser-edit-bookmarks-screen';
import {BrowserHomePageScreen} from '@app/screens/HomeStack/BrowserStack/browser-home-page-screen';
import {BrowserSearchPageScreen} from '@app/screens/HomeStack/BrowserStack/browser-search-page-screen';
import {Web3BrowserScreen} from '@app/screens/HomeStack/BrowserStack/web3-browser';
import {IS_IOS} from '@app/variables/common';

export enum BrowserStackRoutes {
  BrowserHomePage = 'browserHomePage',
  Web3browser = 'web3browser',
  BrowserSearchPage = 'browserSearchPage',
  BrowserEditBookmarks = 'browserEditBookmarksScreen',
}

export type BrowserStackParamList = HomeStackParamList & {
  [BrowserStackRoutes.BrowserHomePage]: undefined;
  [BrowserStackRoutes.Web3browser]: {url: string; popup?: boolean};
  [BrowserStackRoutes.BrowserSearchPage]?: {initialSearchText?: string};
  [BrowserStackRoutes.BrowserEditBookmarks]: undefined;
};

const Stack = createNativeStackNavigator<BrowserStackParamList>();

const screenOptions = {
  headerShown: false,
};

const browserHomePageScreenOptions = {
  headerShown: true,
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: Color.transparent,
  },
  headerTitleAlign: 'center' as 'center',
  headerStatusBarHeight: IS_IOS ? undefined : 40,
  headerTitle: () => <Text t8 center i18n={I18N.homeBrowserTitle} />,
  headerLeft: () => <></>,
};

export const BrowserStack = memo(() => {
  return (
    <Stack.Navigator
      initialRouteName={BrowserStackRoutes.BrowserHomePage}
      screenOptions={screenOptions}>
      <Stack.Screen
        name={BrowserStackRoutes.BrowserHomePage}
        component={BrowserHomePageScreen}
        options={browserHomePageScreenOptions}
      />
      <Stack.Screen
        name={BrowserStackRoutes.Web3browser}
        component={Web3BrowserScreen}
      />
      <Stack.Screen
        name={BrowserStackRoutes.BrowserSearchPage}
        component={BrowserSearchPageScreen}
      />
      <Stack.Screen
        name={BrowserStackRoutes.BrowserEditBookmarks}
        component={BrowserEditBookmarksScreen}
      />
    </Stack.Navigator>
  );
});
