import React, {useCallback, useEffect, useRef, useState} from 'react';

import {ProviderLedgerReactNative} from '@haqq/provider-ledger-react-native';

import {ChooseAccountTabNames} from '@app/components/choose-account/choose-account';
import {LedgerAccounts} from '@app/components/ledger-accounts';
import {app} from '@app/contexts';
import {awaitForBluetooth} from '@app/helpers/await-for-bluetooth';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';
import {LedgerAccountItem} from '@app/types';
import {
  ETH_HD_SHORT_PATH,
  LEDGER_APP,
  LEDGER_HD_PATH_TEMPLATE,
} from '@app/variables/common';

export const LedgerAccountsScreen = () => {
  const navigation = useTypedNavigation();
  const {deviceId, deviceName} = useTypedRoute<'ledgerAccounts'>().params;
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
  const [tab, setTab] = useState<ChooseAccountTabNames>(
    ChooseAccountTabNames.Ledger,
  );
  const loadAbortController = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => {
      provider.abort();
    };
  }, [provider]);

  const onTabChanged = useCallback((item: ChooseAccountTabNames) => {
    loadAbortController.current?.abort();
    setLastIndex(0);
    setAddresses([]);
    setTab(item);
    loadAccounts(item);
  }, []);

  const loadAccounts = useCallback(
    async (currentTab?: ChooseAccountTabNames) => {
      if (loading) {
        setLoading(false);
        loadAbortController.current?.abort();
      }

      const controller = new AbortController();
      loadAbortController.current = controller;

      setLoading(true);
      try {
        await awaitForBluetooth();

        const addressList: LedgerAccountItem[] = [];

        for (let i = lastIndex; i < lastIndex + 5; i += 1) {
          if (controller.signal.aborted) {
            throw new Error('Aborted');
          }

          let hdPath = '';

          const activeTab = currentTab ?? tab;

          if (activeTab === ChooseAccountTabNames.Ledger) {
            hdPath = LEDGER_HD_PATH_TEMPLATE.replace('index', String(i));
          } else {
            hdPath = `${ETH_HD_SHORT_PATH}/${i}`;
          }

          const data = await provider.getAccountInfo(hdPath);

          const balance = await EthNetwork.getBalance(data.address);

          addressList.push({
            address: data.address.toLowerCase(),
            hdPath,
            publicKey: data.publicKey,
            exists: Wallet.addressList().includes(data.address.toLowerCase()),
            balance: balance.toFloat(),
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
    },
    [lastIndex, loading, provider, tab],
  );

  useEffect(() => {
    if (lastIndex === 0 && !loading) {
      loadAccounts();
    }
  }, [loading, lastIndex, loadAccounts]);

  const onPressAdd = useCallback(
    (item: LedgerAccountItem) => {
      navigation.navigate('ledgerVerify', {
        nextScreen: app.onboarded ? 'ledgerStoreWallet' : 'onboardingSetupPin',
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
      onTabChanged={onTabChanged}
    />
  );
};
