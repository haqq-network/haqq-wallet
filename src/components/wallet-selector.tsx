import React, {useCallback, useState} from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';

import {PopupContainer} from '@app/components/ui';
import {WalletRow, WalletRowTypes} from '@app/components/wallet-row';
import {Wallet} from '@app/models/wallet';
import {createTheme} from '@app/theme';

interface Props {
  initialAddress?: string;
  wallets: Wallet[];
  style?: StyleProp<ViewStyle>;

  onWalletSelected?(address: string): void;
}

export const WalletSelector = ({
  wallets,
  onWalletSelected,
  initialAddress,
  style,
}: Props) => {
  const [selectedAddress, setSelectedAddress] = useState(initialAddress);

  const handleWalletPress = useCallback(
    (address: string) => {
      if (address !== selectedAddress) {
        onWalletSelected?.(address);
        setSelectedAddress(address);
      }
    },
    [onWalletSelected, selectedAddress],
  );

  return (
    <PopupContainer style={style}>
      {wallets.map(wallet => {
        return (
          <View key={wallet.address} style={styles.walletRowContainer}>
            <WalletRow
              item={wallet}
              hideArrow
              onPress={handleWalletPress}
              checked={selectedAddress === wallet?.address}
              type={WalletRowTypes.variant5}
            />
          </View>
        );
      })}
    </PopupContainer>
  );
};

const styles = createTheme({
  walletRowContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
