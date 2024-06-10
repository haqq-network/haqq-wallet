import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  HomeFeedStackParamList,
  HomeStackRoutes,
  NftStackParamList,
  NftStackRoutes,
} from '@app/route-types';
import {ScreenOptionType} from '@app/types';

import {NftCollectionDetailsScreen} from './screens/nft-collection-details';
import {NftItemDetailsScreen} from './screens/nft-item-details';

const Stack = createNativeStackNavigator<NftStackParamList>();

const nftCollectionDetailsOptions: ScreenOptionType = {
  ...popupScreenOptions,
  title: getText(I18N.nftCollectionDetailsTitle),
  headerRight: DismissPopupButton,
  headerBackHidden: true,
};
const nftItemDetailsOptions: ScreenOptionType = {
  ...popupScreenOptions,
  title: getText(I18N.nftItemDetailsTitle),
  headerRight: DismissPopupButton,
  headerBackHidden: false,
};

export const NftStack = () => {
  const {
    params: {initScreen, address},
  } = useTypedRoute<HomeFeedStackParamList, HomeStackRoutes.Nft>();

  return (
    <Stack.Navigator initialRouteName={initScreen}>
      <Stack.Screen
        name={NftStackRoutes.NftCollectionDetails}
        component={NftCollectionDetailsScreen}
        options={nftCollectionDetailsOptions}
        initialParams={{address}}
      />

      <Stack.Screen
        name={NftStackRoutes.NftItemDetails}
        component={NftItemDetailsScreen}
        options={nftItemDetailsOptions}
        initialParams={{address}}
      />
    </Stack.Navigator>
  );
};
