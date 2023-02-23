import React, {useEffect} from 'react';

import {TouchableOpacity} from 'react-native-gesture-handler';

import {Text} from '@app/components/ui';
import {useWallets} from '@app/hooks';
import {useWalletConnectSessions} from '@app/hooks/use-wallet-connect-sessions';
import {getWalletConnectAccountsFromSession} from '@app/utils';

export const WalletConnectWalletList = () => {
  const {activeSessions} = useWalletConnectSessions();
  const wallets = useWallets();

  useEffect(() => {
    console.log('🟣', JSON.stringify(activeSessions, null, 2));
  }, [activeSessions, wallets]);

  return (
    <>
      {activeSessions?.map?.(item => {
        const accounts = getWalletConnectAccountsFromSession(item);

        return (
          <TouchableOpacity key={item.topic} style={{borderBottomWidth: 1}}>
            <Text>{item?.self.metadata.name}</Text>
            <Text>{accounts[0].address}</Text>
          </TouchableOpacity>
        );
      })}
    </>
  );
};
