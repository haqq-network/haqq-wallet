import React, {useCallback, useEffect} from 'react';

import {SessionTypes} from '@walletconnect/types';
import {FlatList, ListRenderItem, StyleSheet, View} from 'react-native';

import {WalletConnectAppRow} from '@app/components/wallet-connect-app-row';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useWalletConnectFilteredSessionsByAddress} from '@app/hooks/use-wallet-connect-filtered-sessions-by-address';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';

export const WalletConnectApplicationList = () => {
  const navivation = useTypedNavigation();
  const {params} = useTypedRoute<'walletConnectApplicationList'>();
  const sessions = useWalletConnectFilteredSessionsByAddress(params.address);

  const handleAppPress = useCallback(
    (session: SessionTypes.Struct) => {
      const nextScreen = params.isPopup
        ? 'walletConnectApplicationDetailsPopup'
        : 'walletConnectApplicationDetails';
      navivation.navigate(nextScreen, {session, isPopup: params.isPopup});
    },
    [navivation, params.isPopup],
  );

  const renderItem: ListRenderItem<SessionTypes.Struct> = useCallback(
    ({item}) => <WalletConnectAppRow item={item} onPress={handleAppPress} />,
    [handleAppPress],
  );

  const keyExtractor = useCallback(
    (item: SessionTypes.Struct) => item.topic,
    [],
  );

  useEffect(() => {
    const onFocus = () => {
      if (sessions === undefined) {
        return;
      }

      if (sessions.length === 0) {
        return navivation.goBack();
      }
    };

    return navivation.addListener('focus', onFocus);
  }, [handleAppPress, navivation, sessions]);

  useEffect(() => {
    const title = params?.isPopup
      ? getText(I18N.walletConnectTitle)
      : Wallet.getById(params.address)?.name || params.address;

    navivation.setOptions({
      title,
    });
  }, [params.address, navivation, params?.isPopup]);

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
