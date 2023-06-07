import React, {useCallback} from 'react';

import {NftCollectionDetails} from '@app/components/nft-collection-details';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {NftItem} from '@app/types';

export const NftCollectionDetailsScreen = () => {
  const navigation = useTypedNavigation();
  const {params} = useTypedRoute<'nftCollectionDetails'>();

  const onPressNftItem = useCallback(
    (item: NftItem) => {
      navigation.navigate('nftItemDetails', {item});
    },
    [navigation],
  );

  return (
    <NftCollectionDetails item={params.item} onPressNftItem={onPressNftItem} />
  );
};
