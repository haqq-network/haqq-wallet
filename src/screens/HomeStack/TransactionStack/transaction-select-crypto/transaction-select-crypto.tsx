import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {computed} from 'mobx';
import {observer} from 'mobx-react';
import {ListRenderItem, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

import {SearchInput} from '@app/components/search-input';
import {TokenRow} from '@app/components/token';
import {createTheme} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
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

import {TransactionSelectCryptoSelectAssets} from './transaction-select-crypto-select-assets';
import {TransactionSelectCryptoSelectNetwork} from './transaction-select-crypto-select-network';
import {TransactionSelectCryptoAssetType} from './transaction-select-crypto.types';

import {TransactionStore} from '../transaction-store';

export const TransactionSelectCryptoScreen = observer(() => {
  const {fromAddress, toAddress} = TransactionStore;

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
          Token.tokens[AddressUtils.toEth(fromAddress)]?.filter(item => {
            const showToken =
              !!item.is_in_white_list && !item.is_erc721 && !item.is_erc1155;
            if (networkProvider.ethChainId === ALL_NETWORKS_CHAIN_ID) {
              return showToken;
            } else {
              return showToken && item.chain_id === networkProvider.ethChainId;
            }
          }) ?? [],
      ),
    [fromAddress, Provider.selectedProvider.denom, networkProvider.ethChainId],
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
      navigation.navigate(TransactionStackRoutes.TransactionSum, {
        from: fromAddress,
        to: toAddress,
        token,
      });
    },
    [fromAddress, toAddress],
  );

  const keyExtractor = useCallback((item: IToken) => item.id, []);
  const renderItem: ListRenderItem<IToken> = useCallback(
    ({item}) => <TokenRow item={item} onPress={onItemPress(item)} />,
    [onItemPress],
  );

  useEffect(() => {
    Token.fetchTokens();
    Nft.fetchNft();
  }, []);

  return (
    <FlatList
      data={data}
      style={styles.screen}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={
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
      }
    />
  );
});

const styles = createTheme({
  screen: {
    marginHorizontal: 20,
  },
});
