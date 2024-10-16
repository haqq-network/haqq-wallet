import React from 'react';

import {FlatList} from 'react-native';

import {PopupContainer} from '@app/components/ui';
import {WalletRow} from '@app/components/wallet-row';
import {createTheme} from '@app/helpers';
import {IWalletModel} from '@app/models/wallet';

type TransactionAccountProps = {
  rows: IWalletModel[];
  onPressRow: (address: string) => void;
};

export const TransactionAccount = ({
  rows,
  onPressRow,
}: TransactionAccountProps) => {
  return (
    <PopupContainer style={styles.container}>
      <FlatList
        data={rows}
        renderItem={({item}) => <WalletRow item={item} onPress={onPressRow} />}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
});
