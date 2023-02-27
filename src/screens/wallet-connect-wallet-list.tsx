import React, {useCallback, useMemo} from 'react';

import {StyleSheet, View} from 'react-native';

import {WalletRow} from '@app/components/wallet-row';
import {useTypedNavigation} from '@app/hooks';
import {useWalletConnectAccounts} from '@app/hooks/use-wallet-connect-accounts';
import {Wallet} from '@app/models/wallet';
import {WalletConnect} from '@app/services/wallet-connect';
import {WalletType} from '@app/types';
import {filterWalletConnectSessionsByAddress} from '@app/utils';

export const WalletConnectWalletList = () => {
  const {accounts} = useWalletConnectAccounts();
  const navigation = useTypedNavigation();
  const wallets = useMemo(
    () =>
      accounts
        ?.map?.(item => Wallet.getById(item.address) as Wallet)
        // TODO: add ledger support
        .filter(item => !!item && item?.type !== WalletType.ledgerBt),
    [accounts],
  );

  const handleWalletPress = useCallback(
    (address: string) => {
      const sessionsByAddress = filterWalletConnectSessionsByAddress(
        WalletConnect.instance.getActiveSessions(),
        address,
      );

      if (!sessionsByAddress?.length) {
        return;
      }

      if (sessionsByAddress?.length === 1) {
        return navigation.navigate('walletConnectApplicationDetails', {
          session: sessionsByAddress[0],
        });
      }

      if (sessionsByAddress?.length > 1) {
        return navigation.navigate('walletConnectApplicationList', {
          address,
        });
      }
    },
    [navigation],
  );

  return (
    <View style={styles.container}>
      {wallets?.map?.(item => {
        return (
          <WalletRow
            key={item.address}
            onPress={handleWalletPress}
            item={item}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {width: '90%', alignSelf: 'center'},
});
