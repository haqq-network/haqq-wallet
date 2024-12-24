import React, {useCallback} from 'react';

import {toJS} from 'mobx';
import {ActivityIndicator, FlatList, StyleSheet} from 'react-native';

import {Color, getColor} from '@app/colors';
import {TokenRow} from '@app/components/token';
import {Token} from '@app/models/tokens';
import {IToken} from '@app/types';

import {Spacer} from '../ui';

export type Props = {
  tokens: IToken[];
  onItemPress: (token: IToken) => void;
};

export const TransactionSelectCrypto = ({tokens, onItemPress}: Props) => {
  const keyExtractor = useCallback(
    (item: IToken) => `${item.id}_${item.chain_id}`,
    [],
  );
  const renderItem = useCallback(({item}: {item: IToken}) => {
    if (!item?.id) {
      return null;
    }

    const onPress = () => onItemPress(toJS(item));

    return <TokenRow item={item} onPress={onPress} />;
  }, []);

  const renderListFooterComponent = useCallback(() => {
    return (
      <>
        {Token.isLoading && (
          <>
            <Spacer height={8} />
            <ActivityIndicator size="small" color={getColor(Color.textBase2)} />
          </>
        )}
      </>
    );
  }, [Token.isLoading]);

  return (
    <FlatList
      data={tokens}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.wrapper}
      ListFooterComponent={renderListFooterComponent}
    />
  );
};

const styles = StyleSheet.create({
  wrapper: {paddingHorizontal: 20},
});
