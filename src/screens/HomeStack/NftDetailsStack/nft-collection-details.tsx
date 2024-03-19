import React, {memo, useCallback} from 'react';

import {NftCollectionDetails} from '@app/components/nft-collection-details';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {NftItem} from '@app/models/nft';
import {
  NftDetailsStackParamList,
  NftDetailsStackRoutes,
} from '@app/route-types';

export const NftCollectionDetailsScreen = memo(() => {
  const navigation = useTypedNavigation<NftDetailsStackParamList>();
  const {params} = useTypedRoute<
    NftDetailsStackParamList,
    NftDetailsStackRoutes.NftCollectionDetails
  >();

  const onPressNftItem = useCallback(
    (item: NftItem) => {
      navigation.navigate(NftDetailsStackRoutes.NftItemDetails, {item});
    },
    [navigation],
  );

  return (
    <NftCollectionDetails item={params.item} onPressNftItem={onPressNftItem} />
  );
});
