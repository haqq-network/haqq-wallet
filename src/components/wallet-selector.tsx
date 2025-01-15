import React, {useCallback, useState} from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';

import {PopupContainer} from '@app/components/ui';
import {WalletRow, WalletRowTypes} from '@app/components/wallet-row';
import {createTheme} from '@app/helpers';
import {WalletModel} from '@app/models/wallet';
import {ChainId} from '@app/types';

interface Props {
  initialAddress?: string;
  wallets: WalletModel[];
  style?: StyleProp<ViewStyle>;
  chainId?: ChainId;
  onWalletSelected?(address: string): void;
}

export const WalletSelector = ({
  wallets,
  onWalletSelected,
  initialAddress,
  style,
  chainId,
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
              chainId={chainId}
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
