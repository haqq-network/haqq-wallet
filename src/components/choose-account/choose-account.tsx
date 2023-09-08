import React, {memo, useCallback, useEffect, useRef} from 'react';

import {FlatList, StyleSheet, View} from 'react-native';

import {ChooseAccountFooter} from '@app/components/choose-account/choose-account-footer';
import {ChooseAccountRow} from '@app/components/choose-account/choose-account-row';
import {
  TopTabNavigator,
  TopTabNavigatorVariant,
} from '@app/components/top-tab-navigator';
import {PopupContainer} from '@app/components/ui';
import {I18N, getText} from '@app/i18n';
import {ChooseAccountItem} from '@app/types';

type Props = {
  loading: boolean;
  addresses: ChooseAccountItem[];
  loadMore: () => void;
  onTabChanged: (tab: ChooseAccountTabNames) => void;
  onItemPress: (item: ChooseAccountItem) => void;
  onAdd: () => void;
  walletsToCreate: ChooseAccountItem[];
};

export enum ChooseAccountTabNames {
  Basic = 'basic',
  Ledger = 'ledger',
}

export const ChooseAccount = memo(
  ({
    addresses,
    loading,
    loadMore,
    onTabChanged,
    onItemPress,
    onAdd,
    walletsToCreate,
  }: Props) => {
    const listRef = useRef<FlatList>(null);
    const prevAddressesLength = useRef<number>(0);

    const onTabChange = useCallback((tabName: ChooseAccountTabNames) => {
      onTabChanged(tabName);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        <View style={styles.tabsContentContainerStyle}>
          <TopTabNavigator
            contentContainerStyle={styles.tabsContentContainerStyle}
            tabHeaderStyle={styles.tabHeaderStyle}
            variant={TopTabNavigatorVariant.large}
            showSeparators
            onTabChange={onTabChange}>
            <TopTabNavigator.Tab
              name={ChooseAccountTabNames.Basic}
              title={getText(I18N.chooseAccountBasicTab)}
              component={null}
            />
            <TopTabNavigator.Tab
              name={ChooseAccountTabNames.Ledger}
              title={getText(I18N.chooseAccountLedgerTab)}
              component={null}
            />
          </TopTabNavigator>
        </View>

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
  tabsContentContainerStyle: {
    height: 64,
  },
  tabHeaderStyle: {
    marginHorizontal: 20,
  },
});
