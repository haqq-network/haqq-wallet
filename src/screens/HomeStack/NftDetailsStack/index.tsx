import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  HomeFeedStackParamList,
  HomeFeedStackRoutes,
} from '@app/screens/HomeStack/HomeFeedStack';
import {NftCollectionDetailsScreen} from '@app/screens/HomeStack/NftDetailsStack/nft-collection-details';
import {NftItemDetailsScreen} from '@app/screens/HomeStack/NftDetailsStack/nft-item-details';
import {NftCollection, NftItem, ScreenOptionType} from '@app/types';

export enum NftDetailsStackRoutes {
  NftItemDetails = 'nftItemDetails',
  NftCollectionDetails = 'nftCollectionDetails',
}

export type NftDetailsStackParamList = HomeFeedStackParamList & {
  [NftDetailsStackRoutes.NftItemDetails]: {item: NftItem};
  [NftDetailsStackRoutes.NftCollectionDetails]: {item: NftCollection};
};

const Stack = createNativeStackNavigator<NftDetailsStackParamList>();

const screenOptions: ScreenOptionType = popupScreenOptions;

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

export const NftDetailsStack = () => {
  const route = useTypedRoute<
    HomeFeedStackParamList,
    HomeFeedStackRoutes.NftDetails
  >();
  const {type, ...params} = route.params;
  const screenName =
    type === 'nft'
      ? NftDetailsStackRoutes.NftItemDetails
      : NftDetailsStackRoutes.NftCollectionDetails;

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName={screenName}>
      <Stack.Screen
        name={NftDetailsStackRoutes.NftCollectionDetails}
        component={NftCollectionDetailsScreen}
        options={nftCollectionDetailsOptions}
        initialParams={
          params as unknown as NftDetailsStackParamList[NftDetailsStackRoutes.NftCollectionDetails]
        }
      />
      <Stack.Screen
        name={NftDetailsStackRoutes.NftItemDetails}
        component={NftItemDetailsScreen}
        options={nftItemDetailsOptions}
        initialParams={
          params as unknown as NftDetailsStackParamList[NftDetailsStackRoutes.NftItemDetails]
        }
      />
    </Stack.Navigator>
  );
};
