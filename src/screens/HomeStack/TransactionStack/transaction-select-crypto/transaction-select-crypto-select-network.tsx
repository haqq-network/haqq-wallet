import {useCallback} from 'react';

import {observer} from 'mobx-react';
import {ListRenderItem, View} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

import {
  ActionButton,
  ButtonVariant,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Provider, ProviderModel} from '@app/models/provider';

import {TransactionSelectCryptoSelectNetworkProps} from './transaction-select-crypto.types';

export const TransactionSelectCryptoSelectNetwork = observer(
  ({selectedProvider, onChange}: TransactionSelectCryptoSelectNetworkProps) => {
    const providers = Provider.getAll();

    const handlePress = useCallback(
      (provider: ProviderModel) => () => {
        onChange(provider);
      },
      [onChange],
    );

    const keyExtractor = useCallback(
      (item: ProviderModel) => String(item.ethChainId),
      [],
    );
    const renderItem: ListRenderItem<ProviderModel> = useCallback(
      ({item}) => {
        return (
          <ActionButton
            isActive={selectedProvider.ethChainId === item.ethChainId}
            title={item.networkType.toUpperCase()}
            variant={ButtonVariant.contained}
            onPress={handlePress(item)}
          />
        );
      },
      [handlePress, selectedProvider.ethChainId],
    );

    const renderItemSeparator = useCallback(() => <Spacer width={8} />, []);

    return (
      <View style={styles.container}>
        <Text
          i18n={I18N.typeAssets}
          variant={TextVariant.t6}
          style={styles.header}
        />
        <FlatList
          data={providers}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={renderItemSeparator}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  },
);

const styles = createTheme({
  container: {
    marginTop: 8,
    marginBottom: 24,
  },
  header: {
    marginBottom: 12,
  },
});
