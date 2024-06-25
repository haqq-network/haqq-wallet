import React, {useCallback} from 'react';

import {toJS} from 'mobx';
import {FlatList, StyleSheet} from 'react-native';

import {TokenRow} from '@app/components/token-row';
import {IToken} from '@app/types';

export type Props = {
  tokens: IToken[];
  onItemPress: (token: IToken) => void;
};

export const TransactionSelectCrypto = ({tokens, onItemPress}: Props) => {
  const keyExtractor = useCallback((item: IToken) => item.id, []);
  Logger.log('TransactionSelectCrypto', {tokens});
  const renderItem = useCallback(({item}: {item: IToken}) => {
    Logger.log({item});
    if (!item?.id) {
      return null;
    }

    const onPress = () => onItemPress(toJS(item));

    return <TokenRow item={item} onPress={onPress} />;
  }, []);

  return (
    <FlatList
      data={tokens}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.wrapper}
    />
  );
};

const styles = StyleSheet.create({
  wrapper: {paddingHorizontal: 20},
});
