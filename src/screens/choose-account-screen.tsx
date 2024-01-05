import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {ProviderMnemonicReactNative} from '@haqq/provider-mnemonic-react-native';
import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';
import {observer} from 'mobx-react';

import {
  ChooseAccount,
  ChooseAccountTabNames,
} from '@app/components/choose-account/choose-account';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {getWalletsFromProvider} from '@app/helpers/get-wallets-from-provider';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {
  HomeStackRoutes,
  OnboardingStackRoutes,
  SignInStackParamList,
  SignInStackRoutes,
} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {Indexer} from '@app/services/indexer';
import {ChooseAccountItem, ModalType, WalletType} from '@app/types';
import {MAIN_ACCOUNT_NAME} from '@app/variables/common';

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

  const generator = useRef<ReturnType<typeof getWalletsFromProvider> | null>(
    null,
  );
  const walletProvider = useRef<
    ProviderMnemonicReactNative | ProviderSSSReactNative | null
  >(null);

  const isMnemonicProvider =
    walletProvider.current instanceof ProviderMnemonicReactNative;
  const isSSSProvider =
    walletProvider.current instanceof ProviderSSSReactNative;

  useEffect(() => {
    if (params.provider instanceof ProviderSSSReactNative) {
      navigation.setOptions({
        //@ts-ignore
        customBackFunction: () => navigation.popToTop(),
      });
    }
  }, []);

  const goBack = useCallback(() => {
    if (isMnemonicProvider) {
      navigation.goBack();
    }
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
    setLoading(true);
    try {
      walletProvider.current = params.provider;
      if (walletProvider.current instanceof ProviderMnemonicReactNative) {
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
    walletsToCreate
      .filter(_w => !Wallet.getById(_w.address))
      .forEach(item => {
        const total = Wallet.getAll().length;
        const name =
          total === 0
            ? MAIN_ACCOUNT_NAME
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
      });

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
