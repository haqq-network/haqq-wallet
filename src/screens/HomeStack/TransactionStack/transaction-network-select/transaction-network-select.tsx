import {useCallback, useMemo, useState} from 'react';

import {ListRenderItem} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

import {SearchInput} from '@app/components/search-input';
import {KeyboardSafeArea} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {Provider, ProviderModel} from '@app/models/provider';

import {TransactionNetworkSelectItem} from './transaction-network-select-item';

export const TransactionNetworkSelectScreen = () => {
  const [searchProviderValue, setSearchProviderValue] = useState('');

  const providers = Provider.getAllNetworks();

  const visibleProviders = useMemo(() => {
    if (!searchProviderValue) {
      return providers;
    }

    return providers.filter(provider => {
      const providerName = provider.name.toLowerCase();
      const providerCoinName = provider.coinName.toLowerCase();
      const providerDenom = provider.denom.toLowerCase();
      const providerChainId = provider.ethChainId
        .toString()
        .toLocaleLowerCase();

      const searchValue = searchProviderValue.toLocaleLowerCase();

      return (
        providerName.includes(searchValue) ||
        providerCoinName.includes(searchValue) ||
        providerDenom.includes(searchValue) ||
        providerChainId.includes(searchValue)
      );
    });
  }, [providers, searchProviderValue]);

  const keyExtractor = useCallback(
    (item: ProviderModel) => String(item.ethChainId),
    [],
  );
  const renderItem: ListRenderItem<ProviderModel> = useCallback(({item}) => {
    return <TransactionNetworkSelectItem item={item} />;
  }, []);

  return (
    <KeyboardSafeArea style={styles.screen}>
      <FlatList
        data={visibleProviders}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={
          <SearchInput
            value={searchProviderValue}
            onChange={setSearchProviderValue}
          />
        }
      />
    </KeyboardSafeArea>
  );
};

const styles = createTheme({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
