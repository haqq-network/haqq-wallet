import React, {memo} from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {GovernanceButton} from '@app/components/governance-button';
import {QrScannerButton} from '@app/components/qr-scanner-button';
import {popupScreenOptions} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {basicScreenOptions} from '@app/screens';
import {HomeStackParamList} from '@app/screens/HomeStack';
import {GovernanceStack} from '@app/screens/HomeStack/GovernanceStack';
import {HomeFeedScreen} from '@app/screens/HomeStack/HomeFeedStack/home-feed';

export enum HomeFeedStackRoutes {
  HomeFeed = 'homeFeed_',
  Governance = 'governance',
}

export type HomeFeedStackParamList = HomeStackParamList & {
  [HomeFeedStackRoutes.HomeFeed]: undefined;
  [HomeFeedStackRoutes.Governance]: undefined;
};

const Stack = createNativeStackNavigator<HomeFeedStackParamList>();

const HomeFeedStack = memo(() => {
  return (
    <Stack.Navigator screenOptions={basicScreenOptions}>
      <Stack.Screen
        name={HomeFeedStackRoutes.HomeFeed}
        component={HomeFeedScreen}
        options={{
          ...popupScreenOptions,
          headerShown: true,
          headerStyle: {marginTop: 20},
          title: getText(I18N.homeWalletTitle),
          headerRight: QrScannerButton,
          headerLeft: GovernanceButton,
        }}
      />
      <Stack.Screen
        name={HomeFeedStackRoutes.Governance}
        component={GovernanceStack}
      />
    </Stack.Navigator>
  );
});

export {HomeFeedStack};
