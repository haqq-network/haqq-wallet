import {log} from 'detox';
import {Wallet, utils} from 'ethers';

import {sleep} from './sleep';

import {PROVIDER, SOURCE_WALLET} from '../test-variables';

export const getCoins = async (mnemonic: string, amount: string = '0.0017') => {
  const milkWallet = new Wallet(SOURCE_WALLET, PROVIDER);
  const wallet = Wallet.fromMnemonic(mnemonic);
  const tx = {
    to: wallet.address,
    value: utils.parseEther(amount),
  };

  try {
    const result = await milkWallet.sendTransaction(tx);
    log.warn('Sending transaction result: ', JSON.stringify(result));
  } catch (err) {
    log.warn('Error while sending the transaction: ', JSON.stringify(err));
    log.warn('Trying again...');
    await getCoins(mnemonic, amount);
    return;
  }
  await sleep(15_000);
};
