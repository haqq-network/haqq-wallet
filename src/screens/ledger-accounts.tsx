import React, {useCallback, useEffect, useState} from 'react';

import {LedgerAccounts} from '@app/components/ledger-accounts';
import {runUntil} from '@app/helpers';
import {
  useTypedNavigation,
  useTypedRoute,
  useUser,
  useWallets,
} from '@app/hooks';
import {EthNetwork} from '@app/services';
import {LedgerAccountItem} from '@app/types';
import {ETH_HD_SHORT_PATH} from '@app/variables/common';

export const LedgerAccountsScreen = () => {
  const navigation = useTypedNavigation();
  const user = useUser();
  const {deviceId, deviceName} = useTypedRoute<'ledgerAccounts'>().params;

  const [addresses, setAddresses] = useState<LedgerAccountItem[]>([]);
  const wallets = useWallets();

  useEffect(() => {
    const iter = runUntil(deviceId, async eth => {
      const addressList = [];
      for (let i = 0; i < 5; i += 1) {
        const resp = await eth.getAddress(`${ETH_HD_SHORT_PATH}/${i}`);

        const balance = await EthNetwork.getBalance(resp.address);

        addressList.push({
          address: resp.address.toLowerCase(),
          hdPath: `${ETH_HD_SHORT_PATH}/${i}`,
          publicKey: resp.publicKey,
          exists: wallets.addressList.includes(resp.address.toLowerCase()),
          balance,
        });
      }

      return addressList;
    });
    requestAnimationFrame(async () => {
      let done = false;
      do {
        const resp = await iter.next();
        done = resp.done;
        if (resp.value) {
          setAddresses(resp.value);
        }
      } while (!done);
      await iter.abort();
    });

    return () => {
      iter.abort();
    };
  }, [wallets, deviceId]);

  const onPressAdd = useCallback(
    (item: LedgerAccountItem) => {
      navigation.navigate('ledgerVerify', {
        nextScreen: user.onboarded ? 'ledgerStoreWallet' : 'onboardingSetupPin',
        address: item.address,
        hdPath: item.hdPath,
        publicKey: item.publicKey,
        deviceId,
        deviceName,
      });
    },
    [navigation, user.onboarded, deviceId, deviceName],
  );

  return <LedgerAccounts onAdd={onPressAdd} addresses={addresses} />;
};
