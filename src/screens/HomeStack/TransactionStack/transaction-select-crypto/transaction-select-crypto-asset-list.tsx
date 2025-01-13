import {useCallback} from 'react';

import {FlatList, FlatListProps, ListRenderItem} from 'react-native';

import {TokenRow} from '@app/components/token';
import {IToken} from '@app/types';

type TransactionSelectCryptoAssetListProps = Omit<
  FlatListProps<IToken>,
  'keyExtractor' | 'renderItem'
> & {
  data: IToken[];
  onItemPress: (token: IToken) => () => void;
};

export const TransactionSelectCryptoAssetList = ({
  data,
  onItemPress,
  ...props
}: TransactionSelectCryptoAssetListProps) => {
  const keyExtractor = useCallback((item: IToken) => {
    return `${item.id}_${item.chain_id}`;
  }, []);

  const renderItem: ListRenderItem<IToken> = useCallback(
    ({item}) => {
      return <TokenRow item={item} onPress={onItemPress(item)} />;
    },
    [onItemPress],
  );

  return (
    <FlatList
      {...props}
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
};
