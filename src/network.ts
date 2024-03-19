import {ethers} from 'ethers';
import Config from 'react-native-config';

const provider = new ethers.providers.StaticJsonRpcProvider(
  Config.PROVIDER_NETWORK,
  {
    chainId: parseInt(Config.PROVIDER_CHAIN_ID, 10),
    name: 'dev',
  },
);

export const getDefaultNetwork = () => provider;

export const getDefaultChainId = () => parseInt(Config.PROVIDER_CHAIN_ID, 10);
