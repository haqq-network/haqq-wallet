import {log} from 'detox';
import {Wallet, utils} from 'ethers';

import {MilkAddressProxy} from './milkAddressProxy';

export const getCoins = async (
  mnemonic: string,
  amount: string = '0.0017',
  attempt = 1,
) => {
  if (attempt > 3) {
    return;
  }
  const wallet = Wallet.fromMnemonic(mnemonic);

  try {
    await MilkAddressProxy.send(wallet.address, utils.parseEther(amount));
  } catch (err) {
    log.warn('Error while sending the transaction: ', err);
    log.warn('Trying again...');
    await getCoins(mnemonic, amount, attempt + 1);
    return;
  }
};
