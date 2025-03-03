import {JSONRPCError, jsonrpcRequest} from '@haqq/shared-react-native';
import {makePersistable} from '@override/mobx-persist-store';
import {ethers} from 'ethers';
import {makeAutoObservable} from 'mobx';

import {DEBUG_VARS} from '@app/debug-vars';
import {AddressUtils, NATIVE_TOKEN_ADDRESS} from '@app/helpers/address-utils';
import {Provider, ProviderModel} from '@app/models/provider';
import {Token} from '@app/models/tokens';
import {Wallet} from '@app/models/wallet';
import {Indexer} from '@app/services/indexer';
import {storage} from '@app/services/mmkv';
import {RemoteConfig} from '@app/services/remote-config';
import {AddressType, IContract, VerifyAddressResponse} from '@app/types';
import {ERC20_ABI} from '@app/variables/abi';
import {MAINNET_ETH_CHAIN_ID} from '@app/variables/common';

import {AppStore} from '../app';
const CACHE_LIFE_TIME = 3 * 60 * 60 * 1000; // 3 hours

const logger = Logger.create('Whitelist', {stringifyJson: true});

export const getParsedAddressList = (address: string | string[]): string[] => {
  if (typeof address === 'string') {
    return [AddressUtils.toHaqq(address)];
  }

  if (Array.isArray(address)) {
    return address.map(AddressUtils.toHaqq);
  }

  return [];
};

class Whitelist {
  urls: Map<string, boolean> = new Map();
  contracts: Map<string, IContract> = new Map();

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: this.constructor.name,
      properties: ['urls', 'contracts'],
      storage,
      expireIn: CACHE_LIFE_TIME,
    });
  }

  /**
   * @param url - url to check
   * @param enableForceSkip - if true, then whitelist will be ignored if DEBUG_VARS.disableWeb3DomainBlocking or AppStore.isTesterModeEnabled is true
   *
   * set enableForceSkip to false if you want to check whitelist without force skip
   */
  checkUrl = async (url?: string, enableForceSkip = true): Promise<boolean> => {
    if (AppStore.isRpcOnly) {
      return true;
    }

    if (!url) {
      return false;
    }

    logger.log('checkUrl', {url, enableForceSkip});

    if (
      enableForceSkip &&
      (DEBUG_VARS.disableWeb3DomainBlocking ||
        AppStore.isTesterModeEnabled ||
        Provider.selectedProvider.isTestnet)
    ) {
      return true;
    }

    if (enableForceSkip && this.urls.has(url)) {
      return this.urls.get(url)!;
    }

    const isUrlInWhitelist = await Indexer.instance.validateDappDomain(url);
    this.urls.set(url, isUrlInWhitelist);

    return isUrlInWhitelist;
  };

  verifyAddress = async (
    address: string,
    provider?: ProviderModel,
    force = false,
  ): Promise<IContract | null> => {
    provider = provider ?? Provider.selectedProvider;

    const isWallet = Wallet.getAll().some(wallet =>
      AddressUtils.equals(wallet.address, address),
    );

    if (isWallet) {
      return {
        address_type: AddressType.wallet,
        id: AddressUtils.toHaqq(address),
      } as IContract;
    }

    if (!address) {
      return null;
    }

    if (AddressUtils.equals(address, NATIVE_TOKEN_ADDRESS)) {
      return Token.generateNativeTokenContracts()[0];
    }

    if (!force && this.contracts.has(address)) {
      return this.contracts.get(address)!;
    }

    try {
      if (AppStore.isRpcOnly) {
        const etherProvider = new ethers.providers.JsonRpcProvider(
          provider.ethRpcEndpoint,
        );
        const contractInterface = new ethers.Contract(
          address,
          ERC20_ABI,
          etherProvider,
        );

        let symbol = (await contractInterface.symbol()) as string;
        let decimals = (await contractInterface.decimals()) as number;
        let name = (await contractInterface.name()) as string;

        return {
          address_type: AddressType.contract,
          eth_address: AddressUtils.toEth(address),
          id: AddressUtils.toHaqq(address),
          decimals: decimals,
          is_erc20: true,
          is_erc721: false,
          is_erc1155: false,
          is_in_white_list: true,
          chain_id: provider.ethChainId,
          name: name,
          symbol: symbol,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          icon: '',
          min_input_amount: '0',
          is_skip_eth_tx: false,
        } as IContract;
      } else {
        const params: (string | number)[] = getParsedAddressList(address);
        if (!Provider.isAllNetworks) {
          params.push(provider.ethChainId);
        }
        const response = await jsonrpcRequest<VerifyAddressResponse | null>(
          RemoteConfig.get('proxy_server')!,
          'address',
          params,
        );
        const chainId = Provider.isAllNetworks
          ? MAINNET_ETH_CHAIN_ID
          : provider.ethChainId;
        const contract = response?.address[chainId];
        if (contract) {
          this.contracts.set(address, contract);
        }
        return contract ?? null;
      }
    } catch (err) {
      if (err instanceof JSONRPCError) {
        Logger.captureException(err, 'Whitelist:verifyAddress', err.meta);
      }
      logger.error('verifyAddress', err);

      if (this.contracts.has(address)) {
        return this.contracts.get(address)!;
      }

      return null;
    }
  };
}

const instance = new Whitelist();
export {instance as Whitelist};
