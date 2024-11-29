import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {computed} from 'mobx';
import {observer} from 'mobx-react';
import {ListRenderItem} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

import {SearchInput} from '@app/components/search-input';
import {TokenRow} from '@app/components/token';
import {createTheme} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {Provider} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {IToken} from '@app/types';

export const TransactionSelectCryptoScreen = observer(() => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  const {params} = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.TransactionSelectCrypto
  >();

  const tokens = useMemo(
    () =>
      computed(
        () =>
          Token.tokens[AddressUtils.toEth(params.from)]?.filter(
            item =>
              !!item.is_in_white_list && !item.is_erc721 && !item.is_erc1155,
          ) ?? [],
      ),
    [params.from, Provider.selectedProvider.denom],
  ).get();

  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  useEffect(() => {
    Token.fetchTokens();
  }, []);

  const onItemPress = (token: IToken) => {
    navigation.navigate(TransactionStackRoutes.TransactionSum, {
      ...params,
      token,
    });
  };

  const [searchValue, setSearchValue] = useState('');

  const keyExtractor = useCallback((item: IToken) => item.id, []);
  const renderItem: ListRenderItem<IToken> = useCallback(
    ({item}) => <TokenRow item={item} onPress={() => onItemPress(item)} />,
    [],
  );

  return (
    <FlatList
      data={tokens}
      style={styles.screen}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={
        <SearchInput value={searchValue} onChange={setSearchValue} />
      }
    />
  );
});

const styles = createTheme({
  screen: {
    marginHorizontal: 20,
  },
});
