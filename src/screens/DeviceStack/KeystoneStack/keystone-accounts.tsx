import React, {memo, useCallback, useMemo, useRef, useState} from 'react';

import {ProviderKeystoneReactNative} from '@haqq/provider-keystone-react-native/src';

import {KeystoneAccounts} from '@app/components/keystone/keystone-accounts';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {getWalletsFromProvider} from '@app/helpers/get-wallets-from-provider';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {
  KeystoneStackParamList,
  KeystoneStackRoutes,
  SignInStackParamList,
} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {Indexer} from '@app/services/indexer';
import {ChooseAccountItem, ModalType, WalletType} from '@app/types';

const PAGE_SIZE = 5;

export const KeystoneAccountsScreen = memo(() => {
  const navigation = useTypedNavigation<SignInStackParamList>();
  const {qrCBORHex, ...params} = useTypedRoute<
    KeystoneStackParamList,
    KeystoneStackRoutes.KeystoneAccounts
  >().params;
  const provider = useRef(
    new ProviderKeystoneReactNative({
      qrCBORHex,
      awaitForSign: Promise.resolve,
    }),
  );
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<ChooseAccountItem[]>([]);
  const [walletsToCreate, updateWalletsToCreate] = useState<
    ChooseAccountItem[]
  >([]);

  const generator = useRef<ReturnType<typeof getWalletsFromProvider> | null>(
    null,
  );

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const createWalletGenerator = () => {
    if (provider.current !== null) {
      generator.current = getWalletsFromProvider(
        provider.current,
        WalletType.keystone,
      );
    }
  };

  const loadMore = useCallback(
    async (reset: boolean = false) => {
      if (loading) {
        return;
      }
      if (reset || generator.current === null) {
        createWalletGenerator();
      }
      setLoading(true);
      let index = 0;
      let result = reset ? [] : addresses;
      while (index < PAGE_SIZE) {
        if (generator.current) {
          const item = (await generator.current.next()).value;
          result.push(item);
        }
        index += 1;
      }
      const wallets = result.map(item => item.address);
      const balances = await Indexer.instance.updates(
        wallets.map(AddressUtils.toHaqq),
        new Date(0),
      );
      const resultWithBalances = result.map(item => ({
        ...item,
        balance: new Balance(
          balances.total[AddressUtils.toHaqq(item.address)] || item.balance,
        ),
      }));
      setAddresses(resultWithBalances);
      setLoading(false);
    },
    [addresses, loading],
  );

  useEffectAsync(async () => {
    Logger.log('🔵 useEffectAsync');
    setLoading(true);
    try {
      await loadMore();
    } catch (error) {
      Logger.captureException(error, 'keystone chooseAccount');
      switch (error) {
        case 'wallet_already_exists':
          showModal(ModalType.errorAccountAdded);
          goBack();
          break;
        default:
          if (error instanceof Error) {
            Logger.log('error.message', error.message);
            showModal(ModalType.errorCreateAccount);
            goBack();
          }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const data = useMemo(
    (): ChooseAccountItem[] =>
      addresses.map(item => ({
        ...item,
        hdPath: item.path,
        exists:
          !!walletsToCreate.find(w => w.address === item.address)?.exists ||
          !!item.exists,
      })),
    [addresses, walletsToCreate],
  );

  const onItemPress = useCallback(
    (item: ChooseAccountItem) => {
      const newAddresses = addresses.map(address => {
        if (item.address === address.address) {
          return {
            ...address,
            exists: !item.exists,
          };
        }
        return address;
      });

      setAddresses([...newAddresses]);
      updateWalletsToCreate(newAddresses.filter(address => !!address.exists));
    },
    [addresses, setAddresses],
  );

  const onAdd = useCallback(async () => {
    walletsToCreate.forEach(item => {
      Wallet.create(item.name, {...item, isImported: true});
    });

    if (!app.onboarded) {
      //@ts-ignore
      navigator.navigate(KeystoneStackRoutes.OnboardingSetupPin, params);
    } else {
      //@ts-ignore
      navigation.navigate(KeystoneStackRoutes.KeystoneFinish, params);
    }
  }, [
    walletsToCreate,
    params,
    navigation,
    provider.current,
    qrCBORHex,
    app.onboarded,
  ]);

  return (
    <KeystoneAccounts
      addresses={data}
      loading={loading}
      loadMore={loadMore}
      onItemPress={onItemPress}
      onAdd={onAdd}
      walletsToCreate={walletsToCreate}
    />
  );
});
