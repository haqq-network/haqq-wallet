import React from 'react';

import {FlatList} from 'react-native';

import {TransactionEmpty} from '@app/components/transaction-empty';
import {TransactionRow} from '@app/components/transaction-row';
import {PopupContainer} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {Wallet} from '@app/models/wallet';
import {TransactionList} from '@app/types';

import {AccountInfoHeader} from './account-info-header';

export type AccountInfoProps = {
  transactionsList: TransactionList[];
  wallet: Wallet;
  balance: number;
  onSend: () => void;
  onReceive: () => void;
  onPressRow: (hash: string) => void;
};
export const AccountInfo = ({
  wallet,
  balance,
  onSend,
  onReceive,
  onPressRow,
  transactionsList,
}: AccountInfoProps) => {
  return (
    <PopupContainer plain>
      <FlatList
        overScrollMode="never"
        bounces={false}
        style={styles.container}
        scrollEnabled={Boolean(transactionsList.length)}
        ListHeaderComponent={() => (
          <AccountInfoHeader
            wallet={wallet}
            balance={balance}
            onSend={onSend}
            onReceive={onReceive}
          />
        )}
        contentContainerStyle={styles.grow}
        ListEmptyComponent={TransactionEmpty}
        data={transactionsList}
        renderItem={({item}) => (
          <TransactionRow item={item} onPress={onPressRow} />
        )}
        keyExtractor={item => item.hash}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    flex: 1,
  },
  grow: {flexGrow: 1},
});
