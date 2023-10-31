import React, {useCallback} from 'react';

import {FlatList, StyleSheet, View} from 'react-native';

import {ChooseAccountTabNames} from '@app/components/choose-account/choose-account';
import {LedgerAccountsFooter} from '@app/components/ledger-accounts/ledger-accounts-footer';
import {
  TopTabNavigator,
  TopTabNavigatorVariant,
} from '@app/components/top-tab-navigator';
import {PopupContainer} from '@app/components/ui';
import {I18N, getText} from '@app/i18n';
import {LedgerAccountItem} from '@app/types';

import {LedgerAccountsEmpty} from './ledger-accounts-empty';
import {LedgerAccountsRow} from './ledger-accounts-row';

export type LedgerDeviceProps = {
  loading: boolean;
  loadMore: () => void;
  addresses: LedgerAccountItem[];
  onAdd: (address: LedgerAccountItem) => void;
  onTabChanged: (tab: ChooseAccountTabNames) => void;
};

export const LedgerAccounts = ({
  addresses,
  onAdd,
  loadMore,
  loading,
  onTabChanged,
}: LedgerDeviceProps) => {
  const onTabChange = useCallback((tabName: ChooseAccountTabNames) => {
    onTabChanged(tabName);
  }, []);

  return (
    <PopupContainer plain>
      <View style={styles.tabsContentContainerStyle}>
        <TopTabNavigator
          initialTabIndex={1}
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
        style={styles.container}
        contentContainerStyle={styles.grow}
        data={addresses}
        ListEmptyComponent={LedgerAccountsEmpty}
        renderItem={({item, index}) => (
          <LedgerAccountsRow item={item} onPress={onAdd} index={index + 1} />
        )}
      />
      <LedgerAccountsFooter
        loading={loading}
        loadMore={loadMore}
        count={addresses.length}
      />
    </PopupContainer>
  );
};

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
