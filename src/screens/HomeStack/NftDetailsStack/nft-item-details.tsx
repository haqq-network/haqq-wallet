import React, {memo, useCallback} from 'react';

import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  HomeStackRoutes,
  NftDetailsStackParamList,
  NftDetailsStackRoutes,
} from '@app/route-types';
import {NftItemDetails} from '@app/screens/HomeStack/NftDetailsStack/components/nft-item-details/nft-item-details';

export const NftItemDetailsScreen = memo(() => {
  const navigation = useTypedNavigation<NftDetailsStackParamList>();
  const {params} = useTypedRoute<
    NftDetailsStackParamList,
    NftDetailsStackRoutes.NftItemDetails
  >();

  const onPressSend = useCallback(() => {
    const from = params.item.address;

    navigation.navigate(HomeStackRoutes.Transaction, {
      from,
      nft: params.item,
    });
  }, [params.item, navigation]);

  return <NftItemDetails item={params.item} onPressSend={onPressSend} />;
});
