import {ProviderInterface} from '@haqq/provider-base';
import {ProviderKeystoneReactNative} from '@haqq/provider-keystone-react-native';

import {ChooseAccountTabNames} from '@app/components/choose-account/choose-account';
import {I18N, getText} from '@app/i18n';
import {VariablesString} from '@app/models/variables-string';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {AddWalletParams, ChooseAccountItem, WalletType} from '@app/types';
import {promtAsync} from '@app/utils';
import {
  ETH_HD_SHORT_PATH,
  LEDGER_HD_PATH_TEMPLATE,
} from '@app/variables/common';

import {AddressUtils} from './address-utils';

const MNEMONIC_ADDRESS_MAXIMUM_COUNT = 1000;

export async function* getWalletsFromProvider(
  provider: ProviderInterface,
  walletType: WalletType,
  mnemonicType: ChooseAccountTabNames = ChooseAccountTabNames.Basic,
): AsyncGenerator<ChooseAccountItem> {
  let canNext = true;
  let index = 0;
  let result: (AddWalletParams & {
    name: string;
    balance: Balance;
    exists: boolean;
  })[] = [];

  const genHdPath = (_index: number) => {
    if (provider instanceof ProviderKeystoneReactNative) {
      return provider.buildPath(_index);
    }
    if (mnemonicType === ChooseAccountTabNames.Basic) {
      return `${ETH_HD_SHORT_PATH}/${_index}`;
    }
    return LEDGER_HD_PATH_TEMPLATE.replace('index', String(_index));
  };

  while (canNext) {
    const name = await getWalletNameForWalletProvider(
      provider,
      walletType,
      index,
    );
    const hdPath = genHdPath(index);

    Logger.log('✅', {hdPath, index, name});

    const {address} = await provider.getAccountInfo(hdPath);

    canNext = index < MNEMONIC_ADDRESS_MAXIMUM_COUNT;

    if (canNext) {
      const item = {
        address: AddressUtils.toEth(address),
        type: walletType,
        path: hdPath,
        accountId: provider.getIdentifier(),
        name,
        balance: Balance.Empty,
        exists: !!Wallet.getById(address),
      };
      yield item;
    } else {
      canNext = false;
    }

    index += 1;
  }
  return result;
}

export async function getWalletNameForWalletProvider(
  provider: ProviderInterface,
  walletType: WalletType,
  index: number = 0,
) {
  switch (walletType) {
    case WalletType.keystone: {
      const deviceNameKey = `deviceName-${provider.getIdentifier()}`;
      let deviceName = VariablesString.get(deviceNameKey);

      if (!deviceName) {
        deviceName = await promtAsync(
          getText(I18N.keystoneWalletEnterDeviceNameTitle),
          getText(I18N.keystoneWalletEnterDeviceNameMessage),
        );
        VariablesString.set(deviceNameKey, deviceName);
      }

      return getText(I18N.keystoneWalletAccountNumber, {
        walletCount: `${index + 1}`,
        deviceName,
      });
    }
    case WalletType.mnemonic:
    case WalletType.hot:
    case WalletType.ledgerBt:
    case WalletType.sss:
    default: {
      return '';
    }
  }
}
