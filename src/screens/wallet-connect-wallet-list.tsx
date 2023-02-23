import React, {useCallback, useMemo} from 'react';

import {StyleSheet, View} from 'react-native';

import {WalletRow} from '@app/components/wallet-row';
import {useWalletConnectAccounts} from '@app/hooks/use-wallet-connect-accounts';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {WalletType} from '@app/types';

export const WalletConnectWalletList = () => {
  const {accounts} = useWalletConnectAccounts();
  const wallets = useMemo(
    () =>
      accounts
        ?.map?.(item => Wallet.getById(item.address) as Wallet)
        .filter(item => !!item && item?.type !== WalletType.ledgerBt),
    [accounts],
  );

  const handleWalletPress = useCallback((address: string) => {
    navigator.navigate('walletConnectApplicationList', {address});
  }, []);

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
