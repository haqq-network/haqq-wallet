import React, {memo, useCallback} from 'react';

import {NftCollectionDetails} from '@app/components/nft-collection-details';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {NftItem} from '@app/models/nft';
import {NftStackParamList, NftStackRoutes} from '@app/route-types';

export const NftCollectionDetailsScreen = memo(() => {
  const navigation = useTypedNavigation<NftStackParamList>();
  const {params} = useTypedRoute<
    NftStackParamList,
    NftStackRoutes.NftCollectionDetails
  >();

  const onPressNftItem = useCallback(
    (item: NftItem) => {
      navigation.navigate(NftStackRoutes.NftItemDetails, {item});
    },
    [navigation],
  );

  return (
    <NftCollectionDetails item={params.item} onPressNftItem={onPressNftItem} />
  );
});
