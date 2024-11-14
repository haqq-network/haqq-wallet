import {
  ProviderInterface,
  ProviderKeystoneBase,
  ProviderKeystoneEvm,
  ProviderMnemonicBase,
  ProviderMnemonicTron,
  ProviderSSSBase,
  ProviderSSSTron,
} from '@haqq/rn-wallet-providers';

import {ChooseAccountTabNames} from '@app/components/choose-account/choose-account';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {AddWalletParams, ChooseAccountItem, WalletType} from '@app/types';
import {
  ETH_COIN_TYPE,
  ETH_HD_SHORT_PATH,
  LEDGER_HD_PATH_TEMPLATE,
  TRON_COIN_TYPE,
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
      return `${ETH_HD_SHORT_PATH}/${_index}`;
    }
    // TODO: add TRON support for ledger
    return LEDGER_HD_PATH_TEMPLATE.replace('index', String(_index));
  };

  // we need to get tron network provider to generate tron address for wallet
  const tronNetwork = Provider.getAll().find(p => p.isTron);

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
        tronAddress: '',
      };

      // generate tron address for wallet
      if (tronNetwork) {
        // for mnemonic wallets
        if (provider instanceof ProviderMnemonicBase) {
          const {address: tronAddress} = await new ProviderMnemonicTron({
            ...provider._options,
            tronWebHostUrl: tronNetwork.ethRpcEndpoint,
          }).getAccountInfo(hdPath.replace(ETH_COIN_TYPE, TRON_COIN_TYPE));

          item.tronAddress = tronAddress;
        }

        // for sss wallets
        if (provider instanceof ProviderSSSBase) {
          const {address: tronAddress} = await new ProviderSSSTron({
            ...provider._options,
            tronWebHostUrl: tronNetwork.ethRpcEndpoint,
          }).getAccountInfo(hdPath.replace(ETH_COIN_TYPE, TRON_COIN_TYPE));
          item.tronAddress = tronAddress;
        }
        // TODO: add ledger and keystone support for tron

        // check if tron address already exists
        if (!item.exists) {
          item.exists = !!Wallet.getById(item.tronAddress);
        }
      }

      yield item as ChooseAccountItem;
    } else {
      canNext = false;
    }

    index += 1;
  }
  return result;
}
