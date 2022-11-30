import React from 'react';

import {FlatList} from 'react-native';

import {PopupContainer} from '@app/components/ui';
import {WalletRow} from '@app/components/wallet-row';
import {createTheme} from '@app/helpers';
import {Wallet} from '@app/models/wallet';

export type VisibleAccountSelectorProps = {
  wallets: Wallet[];
  onPress: (address: string) => void;
};
export const VisibleAccountSelector = ({
  wallets,
  onPress,
}: VisibleAccountSelectorProps) => {
  return (
    <PopupContainer plain style={styles.container}>
      <FlatList
        data={wallets}
        renderItem={({item}) => <WalletRow item={item} onPress={onPress} />}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    marginHorizontal: 20,
  },
});
