import React, {useCallback} from 'react';

import {observer} from 'mobx-react';

import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Provider} from '@app/models/provider';
import {
  HomeStackRoutes,
  NftStackParamList,
  NftStackRoutes,
} from '@app/route-types';
import {openInAppBrowser} from '@app/utils';

import {NftItemDetails} from './components/nft-item-details/nft-item-details';

export const NftItemDetailsScreen = observer(() => {
  const navigation = useTypedNavigation<NftStackParamList>();
  const {params} = useTypedRoute<
    NftStackParamList,
    NftStackRoutes.NftItemDetails
  >();

  const onPressSend = useCallback(() => {
    const from = params.item.address;

    navigation.navigate(HomeStackRoutes.Transaction, {
      from,
      nft: params.item,
    });
  }, [params.item, navigation]);

  const onPressExplorer = useCallback(() => {
    const url = Provider.selectedProvider.getTokenExplorerUrl(
      params.item.contract,
      params.item.tokenId,
    );
    return openInAppBrowser(url);
  }, [params.item]);

  return (
    <NftItemDetails
      item={params.item}
      onPressSend={onPressSend}
      onPressExplorer={onPressExplorer}
    />
  );
});
