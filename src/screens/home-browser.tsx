import React from 'react';

import {TransitionPresets, createStackNavigator} from '@react-navigation/stack';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {IS_IOS} from '@app/variables/common';

import {BrowserEditBookmarksScreen} from './browser-edit-bookmarks-screen';
import {BrowserHomePageScreen} from './browser-home-page-screen';
import {BrowserSearchPageScreen} from './browser-search-page-screen';
import {Web3BrowserScreen} from './web3-browser';

const BrowserNavigator = createStackNavigator();

const screenOptions = {
  headerShown: false,
};

const browserHomePageScreenOptions = {
  ...TransitionPresets.ModalSlideFromBottomIOS,
  headerShown: true,
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: Color.transparent,
  },
  headerStatusBarHeight: IS_IOS ? undefined : 0,
  headerTitle: () => <Text t8 i18n={I18N.homeBrowserTitle} />,
  headerLeft: () => <></>,
};

export const HomeBrowserScreen = () => {
  return (
    <BrowserNavigator.Navigator
      initialRouteName={'browserHomePage'}
      screenOptions={screenOptions}>
      <BrowserNavigator.Screen
        name={'browserHomePage'}
        component={BrowserHomePageScreen}
        options={browserHomePageScreenOptions}
      />
      <BrowserNavigator.Screen
        name="web3browser"
        component={Web3BrowserScreen}
        options={TransitionPresets.ModalSlideFromBottomIOS}
      />
      <BrowserNavigator.Screen
        name="browserSearchPage"
        component={BrowserSearchPageScreen}
        options={TransitionPresets.ModalSlideFromBottomIOS}
      />
      <BrowserNavigator.Screen
        name="browserEditBookmarksScreen"
        component={BrowserEditBookmarksScreen}
        options={TransitionPresets.ModalSlideFromBottomIOS}
      />
    </BrowserNavigator.Navigator>
  );
};
