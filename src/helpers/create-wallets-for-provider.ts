import {ProviderInterface} from '@haqq/provider-base';

import {wallets} from '@app/contexts';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';
import {WalletType} from '@app/types';
import {ETH_HD_SHORT_PATH, MAIN_ACCOUNT_NAME} from '@app/variables/common';

export async function createWalletsForProvider(provider: ProviderInterface) {
  let canNext = true;
  let index = 0;

  while (canNext) {
    const total = Wallet.getAll().length;

    const name =
      total === 0
        ? MAIN_ACCOUNT_NAME
        : getText(I18N.signinStoreWalletAccountNumber, {
            number: `${total + 1}`,
          });

    const hdPath = `${ETH_HD_SHORT_PATH}/${index}`;

    const {address} = await provider.getAccountInfo(hdPath);

    if (!Wallet.getById(address)) {
      const balance = await EthNetwork.getBalance(address);
      canNext = balance > 0 || index === 0;

      if (canNext) {
        await wallets.addWallet(
          {
            address: address,
            type: WalletType.mnemonic,
            path: hdPath,
            accountId: provider.getIdentifier(),
          },
          name,
        );
      } else {
        canNext = false;
      }
    }

    index += 1;
  }
}
