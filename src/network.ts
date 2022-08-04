import {ethers} from 'ethers';

const provider = new ethers.providers.StaticJsonRpcProvider(
  'http://159.69.6.222:8545',
  {
    chainId: 121799,
    name: 'dev',
  },
);

provider.getBalance = provider.getBalance.bind(provider);

export const getDefaultNetwork = () => provider;
