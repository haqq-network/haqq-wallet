import React from 'react';

import {FlatList, StyleSheet} from 'react-native';

import {LedgerAccountsFooter} from '@app/components/ledger-accounts/ledger-accounts-footer';
import {PopupContainer} from '@app/components/ui';
import {LedgerAccountItem} from '@app/types';

import {LedgerAccountsEmpty} from './ledger-accounts-empty';
import {LedgerAccountsRow} from './ledger-accounts-row';

export type LedgerDeviceProps = {
  loading: boolean;
  loadMore: () => void;
  addresses: LedgerAccountItem[];
  onAdd: (address: LedgerAccountItem) => void;
};

export const LedgerAccounts = ({
  addresses,
  onAdd,
  loadMore,
  loading,
}: LedgerDeviceProps) => {
  return (
    <PopupContainer plain>
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
});
