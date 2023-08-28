import React, {useCallback, useState} from 'react';

import {StyleProp, View, ViewStyle} from 'react-native';
import {Results} from 'realm';

import {PopupContainer} from '@app/components/ui';
import {WalletRow} from '@app/components/wallet-row';
import {createTheme} from '@app/helpers';
import {Wallet} from '@app/models/wallet';

interface Props {
  initialAddress?: string;
  wallets: Wallet[] | Results<Wallet>;
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
      {wallets?.map?.(wallet => {
        return (
          <View key={wallet?.address} style={styles.walletRowContainer}>
            <WalletRow
              item={wallet}
              hideArrow
              onPress={handleWalletPress}
              checked={selectedAddress === wallet?.address}
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
