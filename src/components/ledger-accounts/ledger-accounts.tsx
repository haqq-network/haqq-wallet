import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {PopupContainer} from '../ui';
import {Ledger} from '../../services/ledger';
import {LedgerAccountsRow} from './ledger-accounts-row';
import {LedgerAccountsEmpty} from './ledger-accounts-empty';

export type LedgerDeviceProps = {
  ledgerService: Ledger;
  onAdd: (address: string) => void;
};

export const LedgerAccounts = ({ledgerService, onAdd}: LedgerDeviceProps) => {
  const [addresses, setAddresses] = useState<string[]>([]);

  useEffect(() => {
    const subscription = (a: string) => {
      setAddresses(list => (list.includes(a) ? list : list.concat([a])));
    };
    ledgerService.on('onAddress', subscription);

    const stop = ledgerService.getAddress();

    return () => {
      ledgerService.off('onAddress', subscription);
      stop();
    };
  });

  return (
    <PopupContainer>
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
