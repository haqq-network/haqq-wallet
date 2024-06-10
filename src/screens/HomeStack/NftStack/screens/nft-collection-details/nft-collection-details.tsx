import React, {memo, useCallback, useMemo} from 'react';

import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Nft, NftItem} from '@app/models/nft';
import {NftStackParamList, NftStackRoutes} from '@app/route-types';

import {NftCollectionDetails} from './components';

export const NftCollectionDetailsScreen = memo(() => {
  const navigation = useTypedNavigation<NftStackParamList>();
  const {
    params: {address},
  } = useTypedRoute<NftStackParamList, NftStackRoutes.NftCollectionDetails>();

  const collection = useMemo(() => Nft.getCollectionById(address), [address]);

  const onPressNftItem = useCallback(
    (item: NftItem) => {
      navigation.navigate(NftStackRoutes.NftItemDetails, {
        address: item.address,
      });
    },
    [navigation],
  );

  // FIXME: Show something when collection didn't exists
  if (!collection) {
    return null;
  }

  return (
    <NftCollectionDetails item={collection} onPressNftItem={onPressNftItem} />
  );
});
