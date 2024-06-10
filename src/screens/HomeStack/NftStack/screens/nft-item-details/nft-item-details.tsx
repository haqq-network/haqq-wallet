import React, {memo, useCallback, useMemo} from 'react';

import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Nft} from '@app/models/nft';
import {
  HomeStackRoutes,
  NftStackParamList,
  NftStackRoutes,
} from '@app/route-types';

import {NftItemDetails} from './components';

export const NftItemDetailsScreen = memo(() => {
  const navigation = useTypedNavigation<NftStackParamList>();
  const {
    params: {address},
  } = useTypedRoute<NftStackParamList, NftStackRoutes.NftItemDetails>();

  const nftItem = useMemo(() => Nft.getNftById(address), [address]);

  const onPressSend = useCallback(() => {
    const from = address;

    navigation.navigate(HomeStackRoutes.Transaction, {
      from,
      nft: nftItem,
    });
  }, [address, navigation]);

  if (!nftItem) {
    return null;
  }

  return <NftItemDetails item={nftItem} onPressSend={onPressSend} />;
});
