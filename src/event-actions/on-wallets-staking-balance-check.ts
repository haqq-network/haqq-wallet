import Decimal from 'decimal.js';

import {app} from '@app/contexts';
import {
  StakingMetadata,
  StakingMetadataType,
} from '@app/models/staking-metadata';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {WEI} from '@app/variables/common';

export async function onWalletsStakingBalanceCheck() {
  try {
    const balances = Wallet.getAllVisible().map(w => {
      const metadata = StakingMetadata.getAllByDelegator(
        w.cosmosAddress,
      ).filtered('type != $0', StakingMetadataType.reward);
      const total = metadata.reduce((prev, curr) => prev + curr.amount, 0);
      // TODO: remove WEI after StakingMetadata
      const parsedTotal = new Decimal(total).mul(WEI).toHex();
      return [w.address, new Balance(parsedTotal)];
    });

    await app.onWalletsStakingBalance(Object.fromEntries(balances));
  } catch (e) {
    Logger.error('onWalletsStakingBalanceCheck', e);
  }
}
