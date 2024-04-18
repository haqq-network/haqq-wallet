import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {popupScreenOptionsWithMargin} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  HomeFeedStackParamList,
  HomeStackRoutes,
  NftStackParamList,
  NftStackRoutes,
} from '@app/route-types';
import {ScreenOptionType} from '@app/types';

import {NftCollectionDetailsScreen} from './nft-collection-details';
import {NftItemDetailsScreen} from './nft-item-details';

const Stack = createNativeStackNavigator<NftStackParamList>();

const screenOptions: ScreenOptionType = popupScreenOptionsWithMargin;

const nftCollectionDetailsOptions: ScreenOptionType = {
  title: getText(I18N.nftCollectionDetailsTitle),
  headerRight: DismissPopupButton,
  headerBackHidden: true,
};
const nftItemDetailsOptions: ScreenOptionType = {
  title: getText(I18N.nftItemDetailsTitle),
  headerRight: DismissPopupButton,
  headerBackHidden: false,
};

export const NftStack = () => {
  const {
    params: {initScreen, item},
  } = useTypedRoute<HomeFeedStackParamList, HomeStackRoutes.Nft>();

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName={initScreen}>
      <Stack.Screen
        name={NftStackRoutes.NftCollectionDetails}
        component={NftCollectionDetailsScreen}
        options={nftCollectionDetailsOptions}
        initialParams={
          {item} as NftStackParamList[NftStackRoutes.NftCollectionDetails]
        }
      />
      <Stack.Screen
        name={NftStackRoutes.NftItemDetails}
        component={NftItemDetailsScreen}
        options={nftItemDetailsOptions}
        initialParams={
          {item} as NftStackParamList[NftStackRoutes.NftItemDetails]
        }
      />
    </Stack.Navigator>
  );
};
