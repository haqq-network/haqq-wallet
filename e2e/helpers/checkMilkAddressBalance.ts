import {Wallet, utils} from 'ethers';

import {PROVIDER, SOURCE_WALLET} from '../test-variables';

export const checkMilkAddressBalance = async () => {
  const milkWallet = new Wallet(SOURCE_WALLET, PROVIDER);
  const balanceRaw = await milkWallet.getBalance();
  const MIN_AMOUNT = 10;
  const minAmountInEther = utils.parseEther(String(MIN_AMOUNT));

  if (balanceRaw.lt(minAmountInEther)) {
    throw new Error(
      'Insufficient MilkAddress balance: ' + utils.formatEther(balanceRaw),
    );
  }
};
