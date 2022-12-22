import React, {useEffect, useState} from 'react';

import {FlatList, StyleSheet} from 'react-native';

import {PopupContainer} from '@app/components/ui';
import {runUntil} from '@app/helpers/run-until';
import {useWallets} from '@app/hooks';
import {ETH_HD_PATH} from '@app/variables/common';

import {LedgerAccountsEmpty} from './ledger-accounts-empty';
import {LedgerAccountsRow} from './ledger-accounts-row';

export type LedgerDeviceProps = {
  deviceId: string;
  onAdd: (address: string) => void;
};

export const LedgerAccounts = ({deviceId, onAdd}: LedgerDeviceProps) => {
  const [addresses, setAddresses] = useState<string[]>([]);
  const wallets = useWallets();

  useEffect(() => {
    const iter = runUntil(deviceId, eth => eth.getAddress(ETH_HD_PATH, false));
    requestAnimationFrame(async () => {
      let done = false;
      do {
        const resp = await iter.next();
        done = resp.done;
        if (resp.value) {
          const address = resp.value.address;
          setAddresses(list =>
            list.includes(address) ? list : list.concat([address]),
          );
        }
      } while (!done);
      await iter.abort();
    });

    return () => {
      console.log('LedgerAccounts ret');
      iter.abort();
    };
  }, [deviceId]);

  return (
    <PopupContainer plain>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.grow}
        data={addresses}
        ListEmptyComponent={LedgerAccountsEmpty}
        renderItem={({item}) => (
          <LedgerAccountsRow
            item={item}
            onPress={onAdd}
            wallets={wallets.addressList}
          />
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
