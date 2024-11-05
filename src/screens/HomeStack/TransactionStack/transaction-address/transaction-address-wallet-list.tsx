import {useCallback} from 'react';

import {FlatList, ListRenderItem, View} from 'react-native';

import {Spacer, Text, TextVariant} from '@app/components/ui';
import {WalletRow, WalletRowTypes} from '@app/components/wallet-row';
import {WALLET_ROW_4_WIDTH} from '@app/components/wallet-row-variant-4';
import {I18N} from '@app/i18n';
import {WalletModel} from '@app/models/wallet';

import {TransactionAddressWalletListProps} from './transaction-address.types';

export const TransactionAddressWalletList = ({
  wallets,
  onPress,
}: TransactionAddressWalletListProps) => {
  const keyExtractor = useCallback((item: WalletModel) => item.address, []);

  const renderItem: ListRenderItem<WalletModel> = useCallback(
    ({item}) => (
      <>
        <WalletRow
          item={item}
          onPress={() => onPress(item.address)}
          type={WalletRowTypes.variant4}
        />
        <Spacer width={8} />
      </>
    ),
    [onPress],
  );

  return (
    <View>
      <Text variant={TextVariant.t6} i18n={I18N.transactionMyAccounts} />
      <Spacer height={12} />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={wallets}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        snapToInterval={WALLET_ROW_4_WIDTH}
      />
      <Spacer height={12} />
    </View>
  );
};
