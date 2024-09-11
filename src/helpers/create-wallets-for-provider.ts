import {ProviderInterface} from '@haqq/provider-base';

import {app} from '@app/contexts';
import {I18N, getText} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {WalletType} from '@app/types';
import {ETH_HD_SHORT_PATH} from '@app/variables/common';

import {AddressUtils} from './address-utils';

export async function createWalletsForProvider(
  provider: ProviderInterface,
  walletType: WalletType,
) {
  let canNext = true;
  let index = 0;

  while (canNext) {
    const total = Wallet.getAll().length;

    const name =
      total === 0
        ? getText(I18N.mainAccount)
        : getText(I18N.signinStoreWalletAccountNumber, {
            number: `${total + 1}`,
          });

    const hdPath = `${ETH_HD_SHORT_PATH}/${index}`;

    const {address} = await provider.getAccountInfo(hdPath);

    if (!Wallet.getById(address)) {
      const balance = app.getAvailableBalance(address);
      canNext = balance.isPositive() || index === 0;

      if (canNext) {
        await Wallet.create(name, {
          address: AddressUtils.toEth(address),
          type: walletType,
          path: hdPath,
          accountId: provider.getIdentifier(),
        });
      } else {
        canNext = false;
      }
    }

    index += 1;
  }
}
