import {ethers} from 'ethers';
import {PROVIDER_CHAIN_ID, PROVIDER_NETWORK} from '@env';

const provider = new ethers.providers.StaticJsonRpcProvider(PROVIDER_NETWORK, {
  chainId: parseInt(PROVIDER_CHAIN_ID, 10),
  name: 'dev',
});

provider.getBalance = provider.getBalance.bind(provider);

export const getDefaultNetwork = () => provider;

export const getChainId = () => parseInt(PROVIDER_CHAIN_ID, 10);
