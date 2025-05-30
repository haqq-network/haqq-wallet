import React, {memo, useCallback, useMemo} from 'react';

import {WalletConnectWalletList} from '@app/components/wallet-connect-wallet-list';
import {useTypedNavigation} from '@app/hooks';
import {useWalletConnectAccounts} from '@app/hooks/use-wallet-connect-accounts';
import {Wallet, WalletModel} from '@app/models/wallet';
import {
  WalletConnectStackParamList,
  WalletConnectStackRoutes,
} from '@app/route-types';
import {WalletConnect} from '@app/services/wallet-connect';
import {filterWalletConnectSessionsByAddress} from '@app/utils';

export const WalletConnectWalletListScreen = memo(() => {
  const {accounts, sessions} = useWalletConnectAccounts();
  const navigation = useTypedNavigation<WalletConnectStackParamList>();
  const wallets = useMemo(
    () =>
      accounts
        ?.map?.(item => Wallet.getById(item.address) as WalletModel)
        .filter(item => !!item),
    [accounts],
  );

  const chainId = useMemo(() => {
    const session = sessions?.[0];
    const requiredChain = session?.requiredNamespaces?.eip155?.chains?.[0];
    const optionalChain = session?.optionalNamespaces?.eip155?.chains?.[0];
    const chain = requiredChain || optionalChain;
    if (!chain) {
      return undefined;
    }
    const [, id] = chain.split(':');
    if (!id) {
      return undefined;
    }
    return Number(id);
  }, [sessions]);

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
        return navigation.navigate(
          WalletConnectStackRoutes.WalletConnectApplicationDetails,
          {
            session: sessionsByAddress[0],
          },
        );
      }

      if (sessionsByAddress?.length > 1) {
        return navigation.navigate(
          WalletConnectStackRoutes.WalletConnectApplicationList,
          {
            address,
          },
        );
      }
    },
    [navigation],
  );

  return (
    <WalletConnectWalletList
      handleWalletPress={handleWalletPress}
      wallets={wallets}
      chainId={chainId}
    />
  );
});
