import {
  ProviderHotBase,
  ProviderMnemonicBase,
  ProviderSSSBase,
} from '@haqq/rn-wallet-providers';
import {decryptPassworder, encryptPassworder} from '@haqq/shared-react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

import {app} from '@app/contexts';
import {VariablesString} from '@app/models/variables-string';
import {IWalletModel, Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';
import {ETH_COIN_TYPE, TRON_COIN_TYPE} from '@app/variables/common';

import {AddressUtils} from './address-utils';
import {getProviderStorage} from './get-provider-storage';
import {getUid} from './get-uid';

const PIN_CHANGED_PROVIDERS = 'pin-changed-providers';
const NEW_PIN_KEY = 'new-pin-tepm-cache';

const setPinChangedProvider = (id: string, viewed: boolean) => {
  const providers = getPinChangedProviders();
  providers[id] = viewed;
  VariablesString.set(PIN_CHANGED_PROVIDERS, JSON.stringify(providers));
};

const getPinChangedProviders = () => {
  const viewed = VariablesString.get(PIN_CHANGED_PROVIDERS) || '{}';
  return JSON.parse(viewed) as Record<string, boolean>;
};

const checkPinChangedForProvider = (id: string) => {
  const providers = getPinChangedProviders();
  return providers[id] === true;
};

const clearPinChangedProviders = () => {
  VariablesString.remove(PIN_CHANGED_PROVIDERS);
};

const isPinChangedWithFail = () => {
  return !!Object.keys(getPinChangedProviders()).length;
};

const saveNewPinCache = async (password: string) => {
  const uid = await getUid();
  const pass = await encryptPassworder(uid, {password});
  await EncryptedStorage.setItem(NEW_PIN_KEY, pass);
};

const getNewPinCache = async () => {
  const password = await EncryptedStorage.getItem(NEW_PIN_KEY);

  if (!password) {
    return null;
  }

  const uid = await getUid();
  const resp = await decryptPassworder<{password: string}>(uid, password);
  return resp.password;
};

const removeNewPinCache = async () => {
  await EncryptedStorage.removeItem(NEW_PIN_KEY);
};

const getProviderForUpdatePin = async (
  wallet: IWalletModel,
  getPassword: () => Promise<string>,
) => {
  switch (wallet.type) {
    case WalletType.mnemonic:
      return new ProviderMnemonicBase({
        account: wallet.accountId!,
        getPassword,
      });
    case WalletType.hot:
      return new ProviderHotBase({
        getPassword,
        account: wallet.accountId!,
      });
    case WalletType.sss:
      const storage = await getProviderStorage(wallet.accountId as string);
      return new ProviderSSSBase({
        storage,
        getPassword,
        account: wallet.accountId!,
      });
  }
  return null;
};

const checkPinCorrect = async (wallet: IWalletModel, pin: string) => {
  try {
    const providerWithNewPin = await getProviderForUpdatePin(wallet, () =>
      Promise.resolve(pin),
    );
    if (!providerWithNewPin) {
      throw new Error('providerWithNewPin not found');
    }
    const {address} = await providerWithNewPin.getAccountInfo(
      wallet.path?.replace?.(TRON_COIN_TYPE, ETH_COIN_TYPE)!,
    );
    if (!AddressUtils.equals(address, wallet.address)) {
      throw new Error('address not match');
    }
  } catch (e) {
    Logger.log('checkPinCorrect fail', e);
    return false;
  }
  return true;
};

const updatePin = async (newPin: string) => {
  try {
    await saveNewPinCache(newPin);
    const wallets = Wallet.getAll();
    const appPin = await app.getPassword();
    clearPinChangedProviders();
    for (const wallet of wallets) {
      if (wallet.accountId && !checkPinChangedForProvider(wallet.accountId)) {
        Logger.log('updatePin for wallet', wallet.address);
        const provider = await getProviderForUpdatePin(wallet, () =>
          Promise.resolve(appPin),
        );

        if (provider) {
          await provider.updatePin(newPin);
          setPinChangedProvider(wallet.accountId, true);
          const isPinCorrect = await checkPinCorrect(wallet, newPin);
          if (!isPinCorrect) {
            return await rollbackPin();
          }
          Logger.log('updatePin success', wallet.address);
        }
      }
    }
    await app.setPin(newPin);
    clearPinChangedProviders();
    await removeNewPinCache();
  } catch (e) {
    Logger.captureException(e, 'SecurePinUtils.updatePin');
    await rollbackPin();
    throw e;
  }
};

const recoveryPin = async (oldPin: string) => {
  let success = false;
  const wallets = Wallet.getAll();
  const appPin = await app.getPassword();
  clearPinChangedProviders();
  for (const wallet of wallets) {
    if (wallet.accountId && !checkPinChangedForProvider(wallet.accountId)) {
      const isPinCorrect = await checkPinCorrect(wallet, appPin);
      if (!isPinCorrect) {
        Logger.log('recoveryPin for wallet', wallet.address);
        const provider = await getProviderForUpdatePin(wallet, () =>
          Promise.resolve(oldPin),
        );

        if (provider) {
          await provider.updatePin(appPin);
          const isRecoveredPinCorrect = await checkPinCorrect(wallet, appPin);
          if (!isRecoveredPinCorrect) {
            clearPinChangedProviders();
            Logger.log('recoveryPin incorrect old pin', wallet.address);
            throw new Error('incorrect old pin');
          } else {
            success = true;
          }
        }
      }
      setPinChangedProvider(wallet.accountId, true);
    }
  }
  clearPinChangedProviders();
  return success;
};

const rollbackPin = async () => {
  if (!isPinChangedWithFail()) {
    return;
  }
  const newPin = await getNewPinCache();
  if (!newPin) {
    throw new Error('new pin cache not found');
  }
  const appPin = await app.getPassword();

  const changedProviderIds = Object.keys(getPinChangedProviders());
  const wallets = Wallet.getAll().filter(
    w => w.accountId && changedProviderIds.includes(w.accountId),
  );

  clearPinChangedProviders();
  for (const wallet of wallets) {
    if (wallet.accountId && !checkPinChangedForProvider(wallet.accountId)) {
      const provider = await getProviderForUpdatePin(wallet, () =>
        Promise.resolve(newPin),
      );

      if (provider) {
        await provider.updatePin(appPin);
        setPinChangedProvider(wallet.accountId, true);
      }
    }
  }
  clearPinChangedProviders();
  await removeNewPinCache();
};

const simulateIncorrectPasswordError = async (newPin: string) => {
  await saveNewPinCache(newPin);
  const wallets = Wallet.getAll();
  const appPin = await app.getPassword();
  clearPinChangedProviders();
  for (const wallet of wallets) {
    if (wallet.accountId && !checkPinChangedForProvider(wallet.accountId)) {
      const provider = await getProviderForUpdatePin(wallet, () =>
        Promise.resolve(appPin),
      );

      if (provider) {
        await provider.updatePin(newPin);
        setPinChangedProvider(wallet.accountId, true);
      }
    }
  }
};

export const SecurePinUtils = {
  isPinChangedWithFail,
  updatePin,
  // rollback after error while updatePin
  rollbackPin,
  // recovery pin for frovider when get `incorrect password` error
  recoveryPin,
  simulateIncorrectPasswordError,
  checkPinCorrect,
};
