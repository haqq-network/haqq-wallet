import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';

import {DismissPopupButton} from '@app/components/popup/dismiss-popup-button';
import {popupScreenOptions} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {ScreenOptionType} from '@app/types';

import {NftCollectionDetailsScreen} from './nft-collection-details';
import {NftItemDetailsScreen} from './nft-item-details';

const Navigator = createStackNavigator();

const screenOptions: ScreenOptionType = {
  ...popupScreenOptions,
  keyboardHandlingEnabled: false,
};

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

export const NftDetailsScreen = () => {
  const route = useTypedRoute<'nftDetails'>();
  const {type, ...params} = route.params;
  const screenName = type === 'nft' ? 'nftItemDetails' : 'nftCollectionDetails';

  return (
    <Navigator.Navigator
      screenOptions={screenOptions}
      initialRouteName={screenName}>
      <Navigator.Screen
        name="nftCollectionDetails"
        component={NftCollectionDetailsScreen}
        options={nftCollectionDetailsOptions}
        initialParams={params}
      />
      <Navigator.Screen
        name="nftItemDetails"
        component={NftItemDetailsScreen}
        options={nftItemDetailsOptions}
        initialParams={params}
      />
    </Navigator.Navigator>
  );
};
