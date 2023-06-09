import React from 'react';

import {FlatList, View} from 'react-native';
import {Results} from 'realm';

import {Color, getColor} from '@app/colors';
import {NoTransactionsIcon, Text} from '@app/components/ui';
import {WalletRow} from '@app/components/wallet-row';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';

type SettingsAccountsProps = {
  onPressRow: (address: string) => void;
  rows: Wallet[] | Results<Wallet>;
};

export const SettingsAccounts = ({onPressRow, rows}: SettingsAccountsProps) => {
  if (!rows.length) {
    return (
      <View style={styles.emptyContainer}>
        <NoTransactionsIcon
          color={getColor(Color.graphicSecond3)}
          style={styles.space}
        />
        <Text
          t14
          i18n={I18N.settingsAccountNoWallet}
          color={Color.textSecond1}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={rows}
      renderItem={({item}) => <WalletRow item={item} onPress={onPressRow} />}
      keyExtractor={(wallet: Wallet) => wallet.address}
      style={styles.container}
    />
  );
};

const styles = createTheme({
  container: {paddingHorizontal: 20, flex: 1},
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '50%',
  },
  space: {marginBottom: 12},
});
