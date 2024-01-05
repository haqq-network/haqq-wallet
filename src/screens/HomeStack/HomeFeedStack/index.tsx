import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {QrScannerButton} from '@app/components/qr-scanner-button';
import {popupScreenOptionsWithMargin} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {HomeFeedStackParamList, HomeFeedStackRoutes} from '@app/route-types';
import {basicScreenOptions} from '@app/screens';
import {GovernanceStack} from '@app/screens/HomeStack/GovernanceStack';
import {HomeEarnStack} from '@app/screens/HomeStack/HomeEarnStack';
import {HomeFeedScreen} from '@app/screens/HomeStack/HomeFeedStack/home-feed';
import {NftDetailsStack} from '@app/screens/HomeStack/NftDetailsStack';

const Stack = createNativeStackNavigator<HomeFeedStackParamList>();

const screenOptions = {
  ...popupScreenOptionsWithMargin,
  headerShown: true,
  title: getText(I18N.homeWalletTitle),
  headerRight: QrScannerButton,
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
        name={HomeFeedStackRoutes.NftDetails}
        component={NftDetailsStack}
      />
      <Stack.Screen
        name={HomeFeedStackRoutes.HomeEarn}
        component={HomeEarnStack}
      />
    </Stack.Navigator>
  );
});

export {HomeFeedStack};
