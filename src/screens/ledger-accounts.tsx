import React, {useCallback, useEffect, useState} from 'react';

import {ProviderLedgerReactNative} from '@haqq/provider-ledger-react-native';

import {LedgerAccounts} from '@app/components/ledger-accounts';
import {mockForWallet} from '@app/helpers/mockForWallet';
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
    const provider = new ProviderLedgerReactNative(mockForWallet, {
      cosmosPrefix: 'haqq',
      deviceId,
      hdPath: '',
    });

    requestAnimationFrame(async () => {
      const addressList: LedgerAccountItem[] = [];

      for (let i = 0; i < 5; i += 1) {
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
    });
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
