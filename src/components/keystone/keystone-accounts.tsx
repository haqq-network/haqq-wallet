import React, {memo, useEffect, useRef} from 'react';

import {FlatList, StyleSheet} from 'react-native';

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

    return (
      <PopupContainer plain>
        <FlatList
          ref={listRef}
          style={styles.container}
          contentContainerStyle={styles.grow}
          data={addresses}
          renderItem={({item, index}) => (
            <ChooseAccountRow
              item={item}
              onPress={() => onItemPress(item)}
              index={index + 1}
            />
          )}
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
