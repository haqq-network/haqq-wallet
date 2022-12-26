import React from 'react';

import {FlatList, StyleSheet} from 'react-native';

import {TransactionEmpty} from '@app/components/transaction-empty';
import {TransactionRow} from '@app/components/transaction-row';
import {User} from '@app/models/user';
import {WalletsWrapper} from '@app/screens/wallets';
import {TransactionList} from '@app/types';

type HomeFeedProps = {
  user: User;
  refreshing: boolean;
  onWalletsRefresh: () => void;
  transactionsList: TransactionList[];
  onPressRow: (hash: string) => void;
};

export const HomeFeed = ({
  user,
  refreshing,
  onWalletsRefresh,
  transactionsList,
  onPressRow,
}: HomeFeedProps) => {
  return (
    <FlatList
      key={user.providerId}
      style={styles.container}
      refreshing={refreshing}
      onRefresh={onWalletsRefresh}
      scrollEnabled={Boolean(transactionsList.length)}
      ListHeaderComponent={WalletsWrapper}
      contentContainerStyle={styles.grow}
      ListEmptyComponent={TransactionEmpty}
      data={transactionsList}
      renderItem={({item}) => (
        <TransactionRow item={item} onPress={onPressRow} />
      )}
      keyExtractor={item => item.hash}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grow: {flexGrow: 1},
});
