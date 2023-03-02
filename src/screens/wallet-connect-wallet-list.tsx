import React, {useCallback, useMemo} from 'react';

import {WalletConnectWalletList} from '@app/components/wallet-connect-wallet-list';
import {useTypedNavigation} from '@app/hooks';
import {useWalletConnectAccounts} from '@app/hooks/use-wallet-connect-accounts';
import {Wallet} from '@app/models/wallet';
import {WalletConnect} from '@app/services/wallet-connect';
import {WalletType} from '@app/types';
import {filterWalletConnectSessionsByAddress} from '@app/utils';

export const WalletConnectWalletListScreen = () => {
  const {accounts} = useWalletConnectAccounts();
  const navigation = useTypedNavigation();
  const wallets = useMemo(
    () =>
      accounts
        ?.map?.(item => Wallet.getById(item.address) as Wallet)
        // TODO: add ledger support
        .filter(item => !!item && item?.type !== WalletType.ledgerBt),
    [accounts],
  );

  const handleWalletPress = useCallback(
    (address: string) => {
      const sessionsByAddress = filterWalletConnectSessionsByAddress(
        WalletConnect.instance.getActiveSessions(),
        address,
      );

      if (!sessionsByAddress?.length) {
        return;
      }

      if (sessionsByAddress?.length === 1) {
        return navigation.navigate('walletConnectApplicationDetails', {
          session: sessionsByAddress[0],
        });
      }

      if (sessionsByAddress?.length > 1) {
        return navigation.navigate('walletConnectApplicationList', {
          address,
        });
      }
    },
    [navigation],
  );

  return (
    <WalletConnectWalletList
      handleWalletPress={handleWalletPress}
      wallets={wallets}
    />
  );
};
