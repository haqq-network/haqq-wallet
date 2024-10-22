import {
  ProviderInterface,
  ProviderKeystoneBase,
  ProviderKeystoneEvm,
} from '@haqq/rn-wallet-providers';

import {ChooseAccountTabNames} from '@app/components/choose-account/choose-account';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {AddWalletParams, ChooseAccountItem, WalletType} from '@app/types';
import {
  ETH_HD_SHORT_PATH,
  LEDGER_HD_PATH_TEMPLATE,
  TRON_HD_SHORT_PATH,
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
    if (
      provider instanceof ProviderKeystoneBase ||
      provider instanceof ProviderKeystoneEvm
    ) {
      return provider.buildPath(_index);
    }
    if (mnemonicType === ChooseAccountTabNames.Basic) {
      if (Provider.selectedProvider.isTron) {
        return `${TRON_HD_SHORT_PATH}/${_index}`;
      }
      return `${ETH_HD_SHORT_PATH}/${_index}`;
    }
    // TODO: add TRON support for ledger
    return LEDGER_HD_PATH_TEMPLATE.replace('index', String(_index));
  };

  while (canNext) {
    const hdPath = genHdPath(index);

    const {address} = await provider.getAccountInfo(hdPath);

    canNext = index < MNEMONIC_ADDRESS_MAXIMUM_COUNT;

    if (canNext) {
      const item = {
        address: AddressUtils.toEth(address),
        type: walletType,
        path: hdPath,
        accountId: provider.getIdentifier(),
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
