import React, {useCallback} from 'react';

import {SessionTypes} from '@walletconnect/types';
import {FlatList, ListRenderItem, StyleSheet, View} from 'react-native';

import {WalletConnectAppRow} from '@app/components/wallet-connect-app-row';
import {WalletConnectSessionType} from '@app/types/wallet-connect';

interface WalletConnectApplicationListProps {
  sessions: WalletConnectSessionType[];
  handleAppPress(item: WalletConnectSessionType): void;
}

export const WalletConnectApplicationList = ({
  handleAppPress,
  sessions,
}: WalletConnectApplicationListProps) => {
  const renderItem: ListRenderItem<SessionTypes.Struct> = useCallback(
    ({item}) => <WalletConnectAppRow item={item} onPress={handleAppPress} />,
    [handleAppPress],
  );

  const keyExtractor = useCallback(
    (item: SessionTypes.Struct) => item.topic,
    [],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
});
