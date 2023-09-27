import React, {memo, useCallback, useMemo, useRef, useState} from 'react';

import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {makeID} from '@haqq/shared-react-native';

import {
  ChooseAccount,
  ChooseAccountTabNames,
} from '@app/components/choose-account/choose-account';
import {showModal} from '@app/helpers';
import {getWalletsFromProvider} from '@app/helpers/get-wallets-from-provider';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {Wallet} from '@app/models/wallet';
import {
  SignInStackParamList,
  SignInStackRoutes,
} from '@app/screens/WelcomeStack/SignInStack';
import {Balance} from '@app/services/balance';
import {Indexer} from '@app/services/indexer';
import {ChooseAccountItem, WalletType} from '@app/types';

const PAGE_SIZE = 5;

export const ChooseAccountScreen = memo(() => {
  const navigation = useTypedNavigation<SignInStackParamList>();
  const params = useTypedRoute<
    SignInStackParamList,
    SignInStackRoutes.SigninChooseAccount
  >().params;

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<ChooseAccountItem[]>([]);
  const [walletsToCreate, updateWalletsToCreate] = useState<
    ChooseAccountItem[]
  >([]);

  const generator = useRef<ReturnType<typeof getWalletsFromProvider> | null>(
    null,
  );
  const mnemonicProvider = useRef<Awaited<
    ReturnType<typeof ProviderMnemonicReactNative.initialize>
  > | null>(null);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const createWalletGenerator = (mnemonicType: ChooseAccountTabNames) => {
    if (mnemonicProvider.current !== null) {
      generator.current = getWalletsFromProvider(
        mnemonicProvider.current,
        WalletType.mnemonic,
        mnemonicType,
      );
    }
  };

  const loadMore = useCallback(
    async (
      reset: boolean = false,
      mnemonicType: ChooseAccountTabNames = ChooseAccountTabNames.Basic,
    ) => {
      if (loading) {
        return;
      }
      if (reset || generator.current === null) {
        createWalletGenerator(mnemonicType);
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
      const balances = await Indexer.instance.getBalances(wallets);
      const resultWithBalances = result.map(item => ({
        ...item,
        balance: new Balance(balances[item.address] || item.balance),
      }));
      setAddresses(resultWithBalances);
      setLoading(false);
    },
    [addresses, loading],
  );

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const generatedPassword = String(makeID(10));
      const passwordPromise = () => Promise.resolve(generatedPassword);

      mnemonicProvider.current = await ProviderMnemonicReactNative.initialize(
        params.mnemonic,
        passwordPromise,
        {},
      );

      await mnemonicProvider.current.setMnemonicSaved();

      await loadMore();
    } catch (error) {
      Logger.captureException(error, 'chooseAccount');
      switch (error) {
        case 'wallet_already_exists':
          showModal('errorAccountAdded');
          goBack();
          break;
        default:
          if (error instanceof Error) {
            Logger.log('error.message', error.message);
            showModal('errorCreateAccount');
            goBack();
          }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const onTabChanged = useCallback((item: ChooseAccountTabNames) => {
    setAddresses([]);
    loadMore(true, item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const data = useMemo(
    (): ChooseAccountItem[] =>
      addresses.map(item => ({
        ...item,
        hdPath: item.path,
        publicKey: '',
        exists:
          walletsToCreate.find(wallet => wallet.address === item.address)
            ?.exists ||
          item.exists ||
          false,
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
    [addresses],
  );

  const onAdd = useCallback(async () => {
    walletsToCreate.forEach(item => {
      Wallet.create(item, item.name);
    });
    try {
      if (mnemonicProvider.current) {
        await mnemonicProvider.current.clean();
      }
    } catch (err) {}
    navigation.navigate(SignInStackRoutes.OnboardingSetupPin, {...params});
  }, [walletsToCreate, params, navigation]);

  return (
    <ChooseAccount
      addresses={data}
      loading={loading}
      loadMore={loadMore}
      onTabChanged={onTabChanged}
      onItemPress={onItemPress}
      onAdd={onAdd}
      walletsToCreate={walletsToCreate}
    />
  );
});
