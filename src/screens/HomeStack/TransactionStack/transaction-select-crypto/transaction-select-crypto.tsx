import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {computed} from 'mobx';
import {observer} from 'mobx-react';
import {View} from 'react-native';

import {NftViewerCollectionPreviewList} from '@app/components/nft-viewer/nft-viewer-collection-preview-list';
import {SearchInput} from '@app/components/search-input';
import {useTypedNavigation} from '@app/hooks';
import {Nft} from '@app/models/nft';
import {
  ALL_NETWORKS_CHAIN_ID,
  Provider,
  ProviderModel,
} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {IToken} from '@app/types';

import {TransactionSelectCryptoAssetList} from './transaction-select-crypto-asset-list';
import {TransactionSelectCryptoSelectAssets} from './transaction-select-crypto-select-assets';
import {TransactionSelectCryptoSelectNetwork} from './transaction-select-crypto-select-network';
import {TransactionSelectCryptoAssetType} from './transaction-select-crypto.types';

import {TransactionStore} from '../transaction-store';

export const TransactionSelectCryptoScreen = observer(() => {
  const {wallet, toAddress} = TransactionStore;

  const navigation = useTypedNavigation<TransactionStackParamList>();

  const [searchValue, setSearchValue] = useState('');
  const [assetType, setAssetType] = useState<TransactionSelectCryptoAssetType>(
    TransactionSelectCryptoAssetType.Crypto,
  );
  const [networkProvider, setNetworkProvider] = useState<ProviderModel>(
    Provider.getByEthChainId(ALL_NETWORKS_CHAIN_ID)!,
  );

  const nfts = Nft.getAll();
  const tokens = useMemo(
    () =>
      computed(
        () =>
          Token.tokens[wallet.address]?.filter(item => {
            const showToken =
              !!item.is_in_white_list && !item.is_erc721 && !item.is_erc1155;
            if (networkProvider.ethChainId === ALL_NETWORKS_CHAIN_ID) {
              return showToken;
            } else {
              return showToken && item.chain_id === networkProvider.ethChainId;
            }
          }) ?? [],
      ),
    [
      wallet.address,
      Provider.selectedProvider.denom,
      networkProvider.ethChainId,
    ],
  ).get();

  const data = useMemo(() => {
    switch (assetType) {
      case TransactionSelectCryptoAssetType.Crypto:
        return tokens;
      case TransactionSelectCryptoAssetType.NFT:
        //@ts-ignore
        return nfts as IToken[];
      default:
        return [...tokens, ...nfts] as IToken[];
    }
  }, [tokens, nfts]);

  const onItemPress = useCallback(
    (token: IToken) => () => {
      TransactionStore.fromAsset = token;
      TransactionStore.toAsset = token;
      navigation.navigate(TransactionStackRoutes.TransactionAmount);
    },
    [toAddress],
  );

  const renderListHeaderComponent = useCallback(
    () => (
      <View>
        <SearchInput value={searchValue} onChange={setSearchValue} />
        <TransactionSelectCryptoSelectAssets
          assetType={assetType}
          onChange={setAssetType}
        />
        <TransactionSelectCryptoSelectNetwork
          selectedProvider={networkProvider}
          onChange={setNetworkProvider}
        />
      </View>
    ),
    [searchValue, assetType, networkProvider],
  );

  useEffect(() => {
    Token.fetchTokens();
    Nft.fetchNft();
  }, []);

  switch (assetType) {
    case TransactionSelectCryptoAssetType.NFT:
      return (
        <NftViewerCollectionPreviewList
          onPress={() => {}}
          ListHeaderComponent={renderListHeaderComponent()}
        />
      );
    case TransactionSelectCryptoAssetType.Crypto:
    default:
      return (
        <TransactionSelectCryptoAssetList
          data={data}
          onItemPress={onItemPress}
          ListHeaderComponent={renderListHeaderComponent()}
        />
      );
  }
});
