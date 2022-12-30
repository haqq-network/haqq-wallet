import React from 'react';

import {FlatList, StyleSheet} from 'react-native';

import {PopupContainer} from '@app/components/ui';
import {LedgerAccountItem} from '@app/types';

import {LedgerAccountsEmpty} from './ledger-accounts-empty';
import {LedgerAccountsRow} from './ledger-accounts-row';

export type LedgerDeviceProps = {
  addresses: LedgerAccountItem[];
  onAdd: (address: LedgerAccountItem) => void;
};

export const LedgerAccounts = ({addresses, onAdd}: LedgerDeviceProps) => {
  return (
    <PopupContainer plain>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.grow}
        data={addresses}
        ListEmptyComponent={LedgerAccountsEmpty}
        renderItem={({item}) => (
          <LedgerAccountsRow item={item} onPress={onAdd} />
        )}
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
