import React, {memo, useCallback, useEffect, useRef} from 'react';

import {FlatList, ListRenderItem, StyleSheet} from 'react-native';

import {ChooseAccountFooter} from '@app/components/choose-account/choose-account-footer';
import {ChooseAccountRow} from '@app/components/choose-account/choose-account-row';
import {PopupContainer} from '@app/components/ui';
import {ChooseAccountItem} from '@app/types';

type Props = {
  loading: boolean;
  addresses: ChooseAccountItem[];
  loadMore: () => void;
  onItemPress: (item: ChooseAccountItem) => void;
  onAdd: () => void;
  walletsToCreate: ChooseAccountItem[];
};

export const KeystoneAccounts = memo(
  ({
    addresses,
    loading,
    loadMore,
    onItemPress,
    onAdd,
    walletsToCreate,
  }: Props) => {
    const listRef = useRef<FlatList>(null);
    const prevAddressesLength = useRef<number>(0);

    useEffect(() => {
      requestAnimationFrame(() => {
        if (listRef.current && prevAddressesLength.current < addresses.length) {
          prevAddressesLength.current = addresses.length;
          listRef.current.scrollToEnd({
            animated: true,
          });
        }
      });
    }, [addresses]);

    const keyExtractor = useCallback(
      (item: ChooseAccountItem) => item.address,
      [],
    );

    const renderItem: ListRenderItem<ChooseAccountItem> = useCallback(
      ({item, index}) => (
        <ChooseAccountRow
          item={item}
          onPress={() => onItemPress(item)}
          index={index + 1}
        />
      ),
      [onItemPress],
    );

    return (
      <PopupContainer plain>
        <FlatList
          ref={listRef}
          style={styles.container}
          contentContainerStyle={styles.grow}
          data={addresses}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
        />
        <ChooseAccountFooter
          loading={loading}
          loadMore={loadMore}
          count={walletsToCreate.length}
          onAdd={onAdd}
        />
      </PopupContainer>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grow: {
    flexGrow: 1,
  },
});
