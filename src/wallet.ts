import {ethers, Wallet} from 'ethers';
import {getDefaultNetwork} from './network';

export const loadWalletFromMnemonics = async (
  mnemonics: string,
): Promise<Wallet> => {
  const provider = getDefaultNetwork();
  return ethers.Wallet.fromMnemonic(mnemonics).connect(provider);
};
