import React, {memo, useCallback} from 'react';

import {app} from '@app/contexts';
import {AddressUtils} from '@app/helpers/address-utils';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  HomeStackRoutes,
  NftStackParamList,
  NftStackRoutes,
} from '@app/route-types';
import {openInAppBrowser} from '@app/utils';

import {NftItemDetails} from './components/nft-item-details/nft-item-details';

export const NftItemDetailsScreen = memo(() => {
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
    // https://explorer.haqq.network/token/0xe5C15B68cfE3182c106f60230A1bE377ceaad483/instance/2998
    const url = `${app.provider.explorer}/token/${AddressUtils.toEth(
      params.item.contract,
    )}/instance/${params.item.tokenId}`;
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
