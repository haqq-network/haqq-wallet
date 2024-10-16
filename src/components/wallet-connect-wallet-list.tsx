import React from 'react';

import {StyleSheet, View} from 'react-native';

import {WalletRow} from '@app/components/wallet-row';
import {IWalletModel} from '@app/models/wallet';

interface WalletConnectWalletListProps {
  wallets: IWalletModel[];

  handleWalletPress(address: string): void;
}

export const WalletConnectWalletList = ({
  handleWalletPress,
  wallets,
}: WalletConnectWalletListProps) => {
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
