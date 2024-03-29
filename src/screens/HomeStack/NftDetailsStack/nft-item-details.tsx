import React, {memo, useCallback} from 'react';

import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Wallet} from '@app/models/wallet';
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
    // TODO:
    const from = params.item.contract;

    //FIXME: Test this
    navigation.navigate(HomeStackRoutes.Transaction, {
      from,
      // TODO:
      to: Wallet.getAllVisible()[0].address,
      nft: params.item,
    });
  }, [params.item, navigation]);

  return <NftItemDetails item={params.item} onPressSend={onPressSend} />;
});
