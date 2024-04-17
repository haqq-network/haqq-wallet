import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {popupScreenOptionsWithMargin} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  HomeFeedStackParamList,
  HomeFeedStackRoutes,
  NftStackParamList,
  NftStackRoutes,
} from '@app/route-types';
import {NftCollectionDetailsScreen} from '@app/screens/HomeStack/NftStack/nft-collection-details';
import {NftItemDetailsScreen} from '@app/screens/HomeStack/NftStack/nft-item-details';
import {ScreenOptionType} from '@app/types';

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

export const NftDetailsStack = () => {
  const route = useTypedRoute<
    HomeFeedStackParamList,
    HomeFeedStackRoutes.NftDetails
  >();
  const {type, ...params} = route.params;
  const screenName =
    type === 'nft'
      ? NftStackRoutes.NftItemDetails
      : NftStackRoutes.NftCollectionDetails;

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName={screenName}>
      <Stack.Screen
        name={NftStackRoutes.NftCollectionDetails}
        component={NftCollectionDetailsScreen}
        options={nftCollectionDetailsOptions}
        initialParams={
          params as NftStackParamList[NftStackRoutes.NftCollectionDetails]
        }
      />
      <Stack.Screen
        name={NftStackRoutes.NftItemDetails}
        component={NftItemDetailsScreen}
        options={nftItemDetailsOptions}
        initialParams={
          params as NftStackParamList[NftStackRoutes.NftItemDetails]
        }
      />
    </Stack.Navigator>
  );
};
