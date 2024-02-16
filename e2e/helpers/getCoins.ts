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

  await milkWallet.sendTransaction(tx);

  await sleep(15_000);
};
