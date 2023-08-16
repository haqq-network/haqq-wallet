import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {GovernanceButton} from '@app/components/governance-button';
import {QrScannerButton} from '@app/components/qr-scanner-button';
import {basicScreenOptions} from '@app/screens';
import {HomeStackParamList} from '@app/screens/HomeStack';
import {HomeFeedScreen} from '@app/screens/HomeStack/HomeFeedStack/home-feed';

export enum HomeFeedStackRoutes {
  HomeFeed = 'homeFeed_',
}

export type HomeFeedStackParamList = HomeStackParamList & {
  [HomeFeedStackRoutes.HomeFeed]: undefined;
};

const Stack = createNativeStackNavigator<HomeFeedStackParamList>();

const feedOptions = {
  //FIXME: Header
  headerRight: QrScannerButton,
  headerLeft: GovernanceButton,
};

const HomeFeedStack = memo(() => {
  return (
    <Stack.Navigator screenOptions={basicScreenOptions}>
      <Stack.Screen
        name={HomeFeedStackRoutes.HomeFeed}
        component={HomeFeedScreen}
        options={feedOptions}
      />
    </Stack.Navigator>
  );
});

export {HomeFeedStack};
