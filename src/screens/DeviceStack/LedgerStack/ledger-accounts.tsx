import React, {memo, useCallback, useEffect, useRef, useState} from 'react';

import {ProviderLedgerEvm} from '@haqq/rn-wallet-providers';

import {ChooseAccountTabNames} from '@app/components/choose-account/choose-account';
import {LedgerAccounts} from '@app/components/ledger-accounts';
import {app} from '@app/contexts';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForBluetooth} from '@app/helpers/await-for-bluetooth';
import {safeLoadBalances} from '@app/helpers/safe-load-balances';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {AppStore} from '@app/models/app';
import {Wallet} from '@app/models/wallet';
import {LedgerStackParamList, LedgerStackRoutes} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {LedgerAccountItem} from '@app/types';
import {
  ETH_HD_SHORT_PATH,
  LEDGER_APP,
  LEDGER_HD_PATH_TEMPLATE,
} from '@app/variables/common';

export const LedgerAccountsScreen = memo(() => {
  const navigation = useTypedNavigation<LedgerStackParamList>();
  const {deviceId, deviceName} = useTypedRoute<
    LedgerStackParamList,
    LedgerStackRoutes.LedgerAccounts
  >().params;
  const provider = useRef(
    new ProviderLedgerEvm({
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

          addressList.push({
            address: data.address.toLowerCase(),
            hdPath,
            publicKey: data.publicKey,
            exists: Wallet.addressList().includes(
              AddressUtils.toEth(data.address),
            ),
            balance: Balance.Empty,
          });
        }

        const wallets = addressList.map(item => item.address);
        const balances = await safeLoadBalances(wallets);
        const resultWithBalances = addressList.map(item => ({
          ...item,
          balance: new Balance(
            balances.total.find(t =>
              AddressUtils.equals(t[0], item.address),
            )?.[2] || item.balance,
          ),
        }));

        setAddresses(list => list.concat(resultWithBalances));
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
    async (item: LedgerAccountItem) => {
      await provider.abort();
      navigation.navigate(LedgerStackRoutes.LedgerVerify, {
        type: 'ledger',
        nextScreen: AppStore.isOnboarded
          ? LedgerStackRoutes.LedgerStoreWallet
          : LedgerStackRoutes.OnboardingSetupPin,
        address: AddressUtils.toEth(item.address),
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
});
