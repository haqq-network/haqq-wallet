import {ethers} from 'ethers';
import {PROVIDER_CHAIN_ID, PROVIDER_NETWORK, PROVIDER_WS_NETWORK} from '@env';

const provider = new ethers.providers.StaticJsonRpcProvider(PROVIDER_NETWORK, {
  chainId: parseInt(PROVIDER_CHAIN_ID, 10),
  name: 'dev',
});

export const wsProvider = new ethers.providers.WebSocketProvider(
  PROVIDER_WS_NETWORK,
);

wsProvider.on('debug', resp => console.log('debug', JSON.stringify(resp)));

provider.getBalance = provider.getBalance.bind(provider);

export const getDefaultNetwork = () => provider;

export const getChainId = () => parseInt(PROVIDER_CHAIN_ID, 10);
