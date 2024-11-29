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
import {Provider} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {IToken} from '@app/types';

import {TransactionSelectCryptoSelectAssets} from './transaction-select-crypto-select-assets';
import {TransactionSelectCryptoAssetType} from './transaction-select-crypto.types';

import {TransactionStore} from '../transaction-store';

export const TransactionSelectCryptoScreen = observer(() => {
  const {fromAddress, toAddress} = TransactionStore;

  const navigation = useTypedNavigation<TransactionStackParamList>();

  const [searchValue, setSearchValue] = useState('');
  const [assetType, setAssetType] = useState<TransactionSelectCryptoAssetType>(
    TransactionSelectCryptoAssetType.Crypto,
  );

  const nfts = Nft.getAll();
  const tokens = useMemo(
    () =>
      computed(
        () =>
          Token.tokens[AddressUtils.toEth(fromAddress)]?.filter(
            item =>
              !!item.is_in_white_list && !item.is_erc721 && !item.is_erc1155,
          ) ?? [],
      ),
    [fromAddress, Provider.selectedProvider.denom],
  ).get();
  const data = useMemo(() => tokens, [tokens, nfts]);

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
