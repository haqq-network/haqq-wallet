import {useCallback, useMemo} from 'react';

import {observer} from 'mobx-react';
import {FlatList, ListRenderItem, View} from 'react-native';

import {Spacer, Text, TextVariant} from '@app/components/ui';
import {WalletRow, WalletRowTypes} from '@app/components/wallet-row';
import {WALLET_ROW_4_WIDTH} from '@app/components/wallet-row-variant-4';
import {AddressUtils} from '@app/helpers/address-utils';
import {I18N} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet, WalletModel} from '@app/models/wallet';

import {TransactionAddressWalletListProps} from './transaction-address.types';

import {TransactionStore} from '../transaction-store';

export const TransactionAddressWalletList = observer(
  ({onPress}: TransactionAddressWalletListProps) => {
    const {toAddress, fromAddress, toChainId} = TransactionStore;

    const filteredWallets = useMemo(() => {
      const wallets = Wallet.getAllVisible();

      if (!wallets?.length) {
        return [];
      }
      const isTron = toChainId && Provider.getByEthChainId(toChainId)?.isTron;

      if (!toAddress && fromAddress) {
        return wallets.filter(w => {
          if (isTron && !w.isSupportTron) {
            return false;
          }
          return !AddressUtils.equals(w.address, fromAddress);
        });
      }

      const lowerCaseAddress = toAddress.toLowerCase();

      return wallets.filter(w => {
        if (isTron && !w.isSupportTron) {
          return false;
        }
        return (
          (w.address.toLowerCase().includes(lowerCaseAddress) ||
            w.cosmosAddress.toLowerCase().includes(lowerCaseAddress) ||
            w.tronAddress?.toLowerCase?.()?.includes?.(lowerCaseAddress) ||
            w.name.toLowerCase().includes(lowerCaseAddress)) &&
          !AddressUtils.equals(w.address, fromAddress)
        );
      });
    }, [toAddress, fromAddress]);

    const keyExtractor = useCallback((item: WalletModel) => item.address, []);

    const renderItem: ListRenderItem<WalletModel> = useCallback(
      ({item}) => (
        <>
          <WalletRow
            item={item}
            onPress={() => onPress(item.providerSpecificAddress)}
            type={WalletRowTypes.variant4}
          />
          <Spacer width={8} />
        </>
      ),
      [onPress],
    );

    if (!filteredWallets) {
      return null;
    }

    return (
      <View>
        <Text variant={TextVariant.t6} i18n={I18N.transactionMyAccounts} />
        <Spacer height={12} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredWallets}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          snapToInterval={WALLET_ROW_4_WIDTH}
        />
        <Spacer height={12} />
      </View>
    );
  },
);
