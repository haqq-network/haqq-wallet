import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';

import {
  ChooseAccount,
  ChooseAccountTabNames,
} from '@app/components/choose-account/choose-account';
import {showModal} from '@app/helpers';
import {getWalletsFromProvider} from '@app/helpers/get-wallets-from-provider';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';
import {Indexer} from '@app/services/indexer';
import {
  ChooseAccountItem,
  ModalType,
  WalletInitialData,
  WalletType,
} from '@app/types';

const PAGE_SIZE = 5;

export const ChooseAccountScreen = memo(() => {
  const navigation = useTypedNavigation();
  const params = useTypedRoute<'chooseAccount'>().params;

  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<ChooseAccountItem[]>([]);
  const [walletsToCreate, updateWalletsToCreate] = useState<
    ChooseAccountItem[]
  >([]);

  const generator = useRef<ReturnType<typeof getWalletsFromProvider> | null>(
    null,
  );
  const mnemonicProvider = useRef<
    ProviderMnemonicReactNative | ProviderSSSReactNative | null
  >(null);

  useEffect(() => {
    if (params.provider instanceof ProviderSSSReactNative) {
      navigation.setOptions({
        //@ts-ignore
        customBackFunction: () => navigation.popToTop(),
      });
    }
  }, []);

  const goBack = useCallback(() => {
    if (mnemonicProvider.current instanceof ProviderMnemonicReactNative) {
      navigation.goBack();
    }
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
      const balances = await Indexer.instance.updates(
        wallets.map(item => Cosmos.addressToBech32(item)),
        new Date(0),
      );
      const resultWithBalances = result.map(item => ({
        ...item,
        balance: new Balance(
          balances.total[Cosmos.addressToBech32(item.address)] || item.balance,
        ),
      }));
      setAddresses(resultWithBalances);
      setLoading(false);
    },
    [addresses, loading],
  );

  useEffectAsync(async () => {
    setLoading(true);
    try {
      mnemonicProvider.current = params.provider;
      if (mnemonicProvider.current instanceof ProviderMnemonicReactNative) {
        await mnemonicProvider.current.setMnemonicSaved();
      }

      await loadMore();
    } catch (error) {
      Logger.captureException(error, 'chooseAccount');
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

  const onTabChanged = useCallback((item: ChooseAccountTabNames) => {
    setAddresses([]);
    loadMore(true, item);
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
      Wallet.create(item.name, item);
    });
    try {
      if (mnemonicProvider.current) {
        await mnemonicProvider.current.clean();
      }
    } catch (err) {}

    if (params.provider instanceof ProviderMnemonicReactNative) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {provider, ...restParams} = params as WalletInitialData & {
        provider: ProviderMnemonicReactNative;
      };
      navigation.navigate('onboardingSetupPin', restParams);
    } else {
      navigation.navigate('onboardingFinish');
    }
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
