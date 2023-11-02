import React, {memo, useCallback} from 'react';

import {NftItemDetails} from '@app/components/nft-item-details';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Wallet} from '@app/models/wallet';
import {HomeStackRoutes} from '@app/screens/HomeStack';
import {
  NftDetailsStackParamList,
  NftDetailsStackRoutes,
} from '@app/screens/HomeStack/NftDetailsStack';

export const NftItemDetailsScreen = memo(() => {
  const navigation = useTypedNavigation<NftDetailsStackParamList>();
  const {params} = useTypedRoute<
    NftDetailsStackParamList,
    NftDetailsStackRoutes.NftItemDetails
  >();

  const onPressSend = useCallback(() => {
    // TODO:
    const from = params.item.owner_address;

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
