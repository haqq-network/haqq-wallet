import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {ProviderMnemonicBase, ProviderSSSBase} from '@haqq/rn-wallet-providers';
import {useFocusEffect} from '@react-navigation/native';
import {observer} from 'mobx-react';

import {
  ChooseAccount,
  ChooseAccountTabNames,
} from '@app/components/choose-account/choose-account';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {getTronProviderForNewWallet} from '@app/helpers/get-provider-for-new-wallet';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {getWalletsFromProvider} from '@app/helpers/get-wallets-from-provider';
import {safeLoadBalances} from '@app/helpers/safe-load-balances';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {I18N, getText} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {
  HomeStackRoutes,
  OnboardingStackRoutes,
  SignInStackParamList,
  SignInStackRoutes,
} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {
  AddressTron,
  ChooseAccountItem,
  ModalType,
  WalletType,
} from '@app/types';
import {ETH_COIN_TYPE, TRON_COIN_TYPE} from '@app/variables/common';

const PAGE_SIZE = 5;

export const ChooseAccountScreen = observer(() => {
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
  const [focus, setFocus] = useState(false);

  const generator = useRef<ReturnType<typeof getWalletsFromProvider> | null>(
    null,
  );
  const walletProvider = useRef<ProviderMnemonicBase | ProviderSSSBase | null>(
    null,
  );

  const isMnemonicProvider =
    walletProvider.current instanceof ProviderMnemonicBase;
  const isSSSProvider = walletProvider.current instanceof ProviderSSSBase;

  useEffect(() => {
    if (params.provider instanceof ProviderSSSBase) {
      navigation.setOptions({
        //@ts-ignore
        customBackFunction: () => navigation.popToTop(),
      });
    }
  }, []);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const createWalletGenerator = (mnemonicType: ChooseAccountTabNames) => {
    if (walletProvider.current !== null) {
      generator.current = getWalletsFromProvider(
        walletProvider.current,
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
      const isTron = Provider.selectedProvider.isTron;
      const wallets = result.map(item =>
        isTron ? item.tronAddress! : item.address,
      );
      const balances = await safeLoadBalances(wallets);
      const resultWithBalances = result.map(item => ({
        ...item,
        balance: new Balance(
          balances?.total.find(t => {
            const addressKey = isTron
              ? AddressUtils.hexToTron(t[0])
              : AddressUtils.toHaqq(t[0]);
            const itemAddress = isTron
              ? item.tronAddress!
              : AddressUtils.toHaqq(item.address);
            return addressKey === itemAddress;
          })?.[2] || item.balance,
        ),
      }));
      setAddresses(resultWithBalances);
      setLoading(false);
    },
    [addresses, loading],
  );

  useEffectAsync(async () => {
    if (!focus) {
      return;
    }
    setLoading(true);
    try {
      walletProvider.current = params.provider;
      if (walletProvider.current instanceof ProviderMnemonicBase) {
        await walletProvider.current.setMnemonicSaved();
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
  }, [focus]);

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
          walletsToCreate.find(wallet => {
            return (
              wallet.address === item.address ||
              (!!wallet.tronAddress &&
                !!item.tronAddress &&
                wallet.tronAddress === item.tronAddress)
            );
          })?.exists ||
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
    walletsToCreate
      .filter(_w => !Wallet.getById(_w.address))
      .forEach(async item => {
        const total = Wallet.getAll().length;
        const name =
          total === 0
            ? getText(I18N.mainAccount)
            : getText(I18N.signinStoreWalletAccountNumber, {
                number: `${total + 1}`,
              });

        Wallet.create(name, item);
        if (isSSSProvider) {
          Wallet.update(item.address, {
            socialLinkEnabled: true,
            type: WalletType.sss,
          });
        }

        // generate tron wallet address
        const tronProvider = await getTronProviderForNewWallet(
          item.type,
          item.accountId!,
        );

        if (!item.tronAddress) {
          const {address: tronAddress} = await tronProvider.getAccountInfo(
            // for tron coin type
            item.path?.replace?.(ETH_COIN_TYPE, TRON_COIN_TYPE)!,
          );
          Wallet.update(item.address, {
            tronAddress: tronAddress as AddressTron,
          });
        }
      });

    if (isSSSProvider) {
      const accountID = walletsToCreate[0].accountId;
      //@ts-ignore
      const storage = await getProviderStorage(accountID, params.sssProvider);
      await ProviderSSSBase.setStorageForAccount(accountID, storage);
    }

    if (isMnemonicProvider && !app.onboarded) {
      //@ts-ignore
      navigation.navigate(SignInStackRoutes.OnboardingSetupPin, params);
    } else {
      if (app.onboarded) {
        //@ts-ignore
        navigation.navigate(HomeStackRoutes.Home);
        return;
      }

      //@ts-ignore
      navigation.navigate(OnboardingStackRoutes.OnboardingFinish);
    }
  }, [
    walletsToCreate,
    params,
    navigation,
    walletProvider.current,
    Wallet.getAll().length,
  ]);

  useFocusEffect(
    useCallback(() => {
      setFocus(true);
    }, []),
  );

  if (!focus) {
    return null;
  }

  return (
    <ChooseAccount
      addresses={data}
      loading={loading}
      loadMore={loadMore}
      onTabChanged={onTabChanged}
      onItemPress={onItemPress}
      onAdd={onAdd}
      walletsToCreate={walletsToCreate.filter(
        _w => !Wallet.getById(_w.address),
      )}
    />
  );
});
