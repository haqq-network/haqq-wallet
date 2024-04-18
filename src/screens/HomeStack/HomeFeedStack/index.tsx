import React, {memo} from 'react';

import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {QrScannerButton} from '@app/components/qr-scanner-button';
import {Spacer} from '@app/components/ui';
import {popupScreenOptionsWithMargin} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {HomeFeedStackParamList, HomeFeedStackRoutes} from '@app/route-types';
import {basicScreenOptions} from '@app/screens';
import {GovernanceStack} from '@app/screens/HomeStack/GovernanceStack';
import {HomeEarnStack} from '@app/screens/HomeStack/HomeEarnStack';
import {HomeFeedScreen} from '@app/screens/HomeStack/HomeFeedStack/home-feed';
import {HomeStoriesScreen} from '@app/screens/HomeStack/HomeFeedStack/home-stories';

const Stack = createNativeStackNavigator<HomeFeedStackParamList>();

const screenOptions: NativeStackNavigationOptions = {
  ...popupScreenOptionsWithMargin,
  headerShown: true,
  title: getText(I18N.homeWalletTitle),
  headerRight: QrScannerButton,
  headerLeft: () => <Spacer width={20} />,
};

const fullScreenModal: NativeStackNavigationOptions = {
  presentation: 'fullScreenModal',
};

const HomeFeedStack = memo(() => {
  return (
    <Stack.Navigator screenOptions={basicScreenOptions}>
      <Stack.Screen
        name={HomeFeedStackRoutes.HomeFeed}
        component={HomeFeedScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name={HomeFeedStackRoutes.Governance}
        component={GovernanceStack}
      />
      <Stack.Screen
        name={HomeFeedStackRoutes.HomeEarn}
        component={HomeEarnStack}
      />
      <Stack.Screen
        name={HomeFeedStackRoutes.HomeStories}
        component={HomeStoriesScreen}
        options={fullScreenModal}
      />
    </Stack.Navigator>
  );
});

export {HomeFeedStack};
