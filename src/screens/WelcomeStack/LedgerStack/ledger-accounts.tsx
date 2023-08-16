import React, {memo, useCallback, useEffect, useRef, useState} from 'react';

import {ProviderLedgerReactNative} from '@haqq/provider-ledger-react-native';

import {LedgerAccounts} from '@app/components/ledger-accounts';
import {app} from '@app/contexts';
import {awaitForBluetooth} from '@app/helpers/await-for-bluetooth';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Wallet} from '@app/models/wallet';
import {
  LedgerStackParamList,
  LedgerStackRoutes,
} from '@app/screens/WelcomeStack/LedgerStack';
import {EthNetwork} from '@app/services';
import {LedgerAccountItem} from '@app/types';
import {ETH_HD_SHORT_PATH, LEDGER_APP} from '@app/variables/common';

export const LedgerAccountsScreen = memo(() => {
  const navigation = useTypedNavigation<LedgerStackParamList>();
  const {deviceId, deviceName} = useTypedRoute<
    LedgerStackParamList,
    LedgerStackRoutes.LedgerAccounts
  >().params;
  const provider = useRef(
    new ProviderLedgerReactNative({
      getPassword: app.getPassword.bind(app),
      deviceId,
      appName: LEDGER_APP,
    }),
  ).current;
  const [lastIndex, setLastIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<LedgerAccountItem[]>([]);

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
          const data = await provider.getAccountInfo(
            `${ETH_HD_SHORT_PATH}/${i}`,
          );

          const balance = await EthNetwork.getBalance(data.address);

          addressList.push({
            address: data.address.toLowerCase(),
            hdPath: `${ETH_HD_SHORT_PATH}/${i}`,
            publicKey: data.publicKey,
            exists: Wallet.addressList().includes(data.address.toLowerCase()),
            balance,
          });
        }

        setAddresses(list => list.concat(addressList));
        setLastIndex(lastIndex + 5);
      } catch (e) {
        if (e instanceof Error) {
          Logger.log(e.message);
        }
      } finally {
        setLoading(false);
      }
    });
  }, [lastIndex, provider]);

  useEffect(() => {
    if (lastIndex === 0 && !loading) {
      loadAccounts();
    }
  }, [loading, lastIndex, loadAccounts]);

  const onPressAdd = useCallback(
    (item: LedgerAccountItem) => {
      navigation.navigate(LedgerStackRoutes.LedgerVerify, {
        type: 'ledger',
        nextScreen: app.onboarded
          ? LedgerStackRoutes.LedgerStoreWallet
          : LedgerStackRoutes.OnboardingSetupPin,
        address: item.address,
        hdPath: item.hdPath,
        publicKey: item.publicKey,
        deviceId,
        deviceName,
      });
    },
    [navigation, deviceId, deviceName],
  );

  return (
    <LedgerAccounts
      onAdd={onPressAdd}
      addresses={addresses}
      loading={loading}
      loadMore={loadAccounts}
    />
  );
});
