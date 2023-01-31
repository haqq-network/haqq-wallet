import React, {useCallback, useEffect, useRef, useState} from 'react';

import {ProviderLedgerReactNative} from '@haqq/provider-ledger-react-native';

import {LedgerAccounts} from '@app/components/ledger-accounts';
import {awaitForBluetooth} from '@app/helpers/await-for-bluetooth';
import {
  useTypedNavigation,
  useTypedRoute,
  useUser,
  useWallets,
} from '@app/hooks';
import {EthNetwork} from '@app/services';
import {LedgerAccountItem} from '@app/types';
import {ETH_HD_SHORT_PATH, LEDGER_APP} from '@app/variables/common';

export const LedgerAccountsScreen = () => {
  const navigation = useTypedNavigation();
  const {deviceId, deviceName} = useTypedRoute<'ledgerAccounts'>().params;
  const user = useUser();
  const provider = useRef(
    new ProviderLedgerReactNative({
      cosmosPrefix: 'haqq',
      deviceId,
      appName: LEDGER_APP,
    }),
  ).current;
  const [lastIndex, setLastIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<LedgerAccountItem[]>([]);
  const wallets = useWallets();

  useEffect(() => {
    return () => {
      provider.abort();
    };
  }, [provider]);

  const loadAccounts = useCallback(() => {
    setLoading(true);
    requestAnimationFrame(async () => {
      try {
        await awaitForBluetooth();

        const addressList: LedgerAccountItem[] = [];

        for (let i = lastIndex; i < lastIndex + 5; i += 1) {
          const data = await provider.getPublicKeyAndAddressForHDPath(
            `${ETH_HD_SHORT_PATH}/${i}`,
          );

          const balance = await EthNetwork.getBalance(data.address);

          addressList.push({
            address: data.address.toLowerCase(),
            hdPath: `${ETH_HD_SHORT_PATH}/${i}`,
            publicKey: data.publicKey,
            exists: wallets.addressList.includes(data.address.toLowerCase()),
            balance,
          });
        }

        setAddresses(list => list.concat(addressList));
        setLastIndex(lastIndex + 5);
      } catch (e) {
        if (e instanceof Error) {
          console.log(e.message);
        }
      } finally {
        setLoading(false);
      }
    });
  }, [lastIndex, provider, wallets.addressList]);

  useEffect(() => {
    if (lastIndex === 0 && !loading) {
      loadAccounts();
    }
  }, [loading, lastIndex, loadAccounts]);

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

  return (
    <LedgerAccounts
      onAdd={onPressAdd}
      addresses={addresses}
      loading={loading}
      loadMore={loadAccounts}
    />
  );
};
