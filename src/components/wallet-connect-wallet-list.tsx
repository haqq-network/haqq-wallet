import React from 'react';

import {StyleSheet, View} from 'react-native';

import {WalletRow} from '@app/components/wallet-row';
import {WalletModel} from '@app/models/wallet';

interface WalletConnectWalletListProps {
  wallets: WalletModel[];
  chainId?: number;
  handleWalletPress(address: string): void;
}

export const WalletConnectWalletList = ({
  wallets,
  chainId,
  handleWalletPress,
}: WalletConnectWalletListProps) => {
  return (
    <View style={styles.container}>
      {wallets?.map?.(item => {
        return (
          <WalletRow
            key={item.address}
            onPress={handleWalletPress}
            item={item}
            chainId={chainId}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {width: '90%', alignSelf: 'center'},
});
