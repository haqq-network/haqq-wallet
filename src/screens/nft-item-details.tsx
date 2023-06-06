import React, {useCallback} from 'react';

import {NftItemDetails} from '@app/components/nft-item-details';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Wallet} from '@app/models/wallet';

export const NftItemDetailsScreen = () => {
  const navigation = useTypedNavigation();
  const {params} = useTypedRoute<'nftItemDetails'>();

  const onPressSend = useCallback(() => {
    // TODO:
    const from = params.item.owner_address;

    navigation.navigate('transaction', {
      from,
      // TODO:
      to: Wallet.getAllVisible()[0].address,
      nft: params.item,
    });
  }, [params.item, navigation]);

  return <NftItemDetails item={params.item} onPressSend={onPressSend} />;
};
