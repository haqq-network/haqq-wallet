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

import {NftCollectionDetailsScreen} from './nft-collection-details';
import {NftItemDetailsScreen} from './nft-item-details';

const Stack = createNativeStackNavigator<NftStackParamList>();

export const NftStack = () => {
  const {
    params: {initScreen, item},
  } = useTypedRoute<HomeFeedStackParamList, HomeStackRoutes.Nft>();

  return (
    <Stack.Navigator initialRouteName={initScreen}>
      <Stack.Screen
        name={NftStackRoutes.NftCollectionDetails}
        component={NftCollectionDetailsScreen}
        options={{
          ...popupScreenOptions,
          title: getText(I18N.nftCollectionDetailsTitle),
          headerRight: DismissPopupButton,
          // @ts-ignore
          headerBackHidden: true,
        }}
        initialParams={
          {item} as NftStackParamList[NftStackRoutes.NftCollectionDetails]
        }
      />
      <Stack.Screen
        name={NftStackRoutes.NftItemDetails}
        component={NftItemDetailsScreen}
        options={{
          ...popupScreenOptions,
          title: getText(I18N.nftItemDetailsTitle),
          headerRight: DismissPopupButton,
          // @ts-ignore
          headerBackHidden: false,
        }}
        initialParams={
          {item} as NftStackParamList[NftStackRoutes.NftItemDetails]
        }
      />
    </Stack.Navigator>
  );
};
