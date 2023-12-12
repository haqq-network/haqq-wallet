import {ProviderInterface} from '@haqq/provider-base';

import {ChooseAccountTabNames} from '@app/components/choose-account/choose-account';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {AddWalletParams, ChooseAccountItem, WalletType} from '@app/types';
import {
  ETH_HD_SHORT_PATH,
  LEDGER_HD_PATH_TEMPLATE,
  MAIN_ACCOUNT_NAME,
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
    if (mnemonicType === ChooseAccountTabNames.Basic) {
      return `${ETH_HD_SHORT_PATH}/${_index}`;
    }
    return LEDGER_HD_PATH_TEMPLATE.replace('index', String(_index));
  };

  while (canNext) {
    const total = Wallet.getAll().length;

    const defaultName =
      total + index === 0
        ? MAIN_ACCOUNT_NAME
        : getText(I18N.signinStoreWalletAccountNumber, {
            number: `${total + index + 1}`,
          });
    const keystoneName = getText(I18N.keystoneWalletAccountNumber, {
      number: `${index + 1}`,
    });
    const name =
      walletType === WalletType.keystone ? keystoneName : defaultName;

    const hdPath = genHdPath(index);

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
