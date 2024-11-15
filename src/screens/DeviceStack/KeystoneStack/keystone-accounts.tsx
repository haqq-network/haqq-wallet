import React, {memo, useCallback, useMemo, useRef, useState} from 'react';

import {ProviderKeystoneBase, constants} from '@haqq/rn-wallet-providers';
import {makeID} from '@haqq/shared-react-native';

import {KeystoneAccounts} from '@app/components/keystone/keystone-accounts';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {getWalletsFromProvider} from '@app/helpers/get-wallets-from-provider';
import {safeLoadBalances} from '@app/helpers/safe-load-balances';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {useError} from '@app/hooks/use-error';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {navigator} from '@app/navigator';
import {
  KeystoneStackParamList,
  KeystoneStackRoutes,
  SignInStackParamList,
} from '@app/route-types';
import {Balance} from '@app/services/balance';
import {ChooseAccountItem, ModalType, WalletType} from '@app/types';
import {promtAsync} from '@app/utils';
import {KEYSTONE_NAME, STRINGS} from '@app/variables/common';

const PAGE_SIZE = 5;

export const KeystoneAccountsScreen = memo(() => {
  const navigation = useTypedNavigation<SignInStackParamList>();
  const showError = useError();
  const {qrCBORHex, ...params} = useTypedRoute<
    KeystoneStackParamList,
    KeystoneStackRoutes.KeystoneAccounts
  >().params;
  const provider = useRef(
    new ProviderKeystoneBase({
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
      try {
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
            // if not onboarded, remove wallet if it already exists
            // this wallets appear when user has already created wallet but not finished onboarding
            if (!app.onboarded && item.exists) {
              item.exists = false;
              Wallet.remove(item.address);
            }
            result.push(item);
          }
          index += 1;
        }
        const wallets = result.map(item => item.address);
        const balances = await safeLoadBalances(wallets);

        const resultWithBalances = result.map(item => ({
          ...item,
          balance: new Balance(
            balances.total.find(t =>
              AddressUtils.equals(t[0], item.address),
            )?.[2] || item.balance,
          ),
        }));
        setAddresses(resultWithBalances);
      } catch (error) {
        const errorId = makeID(4);

        if (
          provider.current.getKeyringAccount() ===
          constants.KeyringAccountEnum.ledger_live
        ) {
          showError(errorId, getText(I18N.keystoneWalletSyncPathError));
        } else {
          const errMsg = (error as Error)?.message || '';
          showError(
            errorId,
            getText(I18N.keystoneUnknownError, {error: errMsg}),
          );
          Logger.captureException(error, 'keystone chooseAccount', {
            keyringAccount: provider.current.getKeyringAccount(),
            pathPattern: provider.current.getPathPattern(),
            errorId,
          });
        }
      } finally {
        setLoading(false);
      }
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
    const wallets = Wallet.getAll().filter(it => it.accountId === qrCBORHex);
    const lastIndex = wallets.length || 0;

    let deviceName = '';

    if (lastIndex > 0) {
      deviceName = wallets[0]?.name?.split?.(STRINGS.NBSP)?.[0]?.trim?.() || '';
    }

    if (!deviceName) {
      const keystoneDevicesCount =
        Wallet.getAll().filter(
          (wallet, index, self) =>
            wallet.type === WalletType.keystone &&
            self.findIndex(item => item.accountId === wallet.accountId) ===
              index,
        )?.length || 0;

      deviceName = await promtAsync(
        getText(I18N.keystoneWalletEnterDeviceNameTitle),
        getText(I18N.keystoneWalletEnterDeviceNameMessage),
        {
          defaultValue: `${KEYSTONE_NAME} ${keystoneDevicesCount + 1}`,
        },
      );
    }

    walletsToCreate
      .filter(wallet => {
        return !Wallet.getById(wallet.address);
      })
      .forEach((item, index) => {
        const name = getText(I18N.keystoneWalletAccountNumber, {
          walletCount: `${index + lastIndex}`,
          deviceName: deviceName.replace(STRINGS.NBSP, ' '),
        });
        Wallet.create(name, {...item, isImported: true});
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
