import {makePersistable} from '@override/mobx-persist-store';
import {ethers} from 'ethers';
import {makeAutoObservable, runInAction, when} from 'mobx';

import {AddressUtils, NATIVE_TOKEN_ADDRESS} from '@app/helpers/address-utils';
import {Provider} from '@app/models/provider';
import {Socket} from '@app/models/socket';
import {IWalletModel, Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Indexer} from '@app/services/indexer';
import {storage} from '@app/services/mmkv';
import {
  AddressEthereum,
  AddressType,
  AddressWallet,
  ChainId,
  IContract,
  IToken,
  IndexerToken,
  IndexerTokensData,
  MobXStore,
} from '@app/types';
import {RPCMessage} from '@app/types/rpc';
import {createAsyncTask} from '@app/utils';
import {ERC20_ABI} from '@app/variables/abi';

import {AppStore} from './app';
import {Contract} from './contract';
import {ProviderModel} from './provider';

const logger = Logger.create('TokensStore', {
  emodjiPrefix: '🟢',
  stringifyJson: true,
});

class TokensStore implements MobXStore<IToken> {
  /**
   * All tokens available for all wallets with commulative value
   * @key Token contract address
   * @value IToken
   */
  data: Record<string, IToken> = {};
  fetchedUnknownTokens: Record<string, boolean> = {};
  /**
   * Indexer response with token info
   * @key Wallet address
   * @value Array of tokens for this wallet address
   */
  tokens: IndexerTokensData = {};
  private lastUpdate = new Date(0);
  private _isLoading = false;

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: this.constructor.name,
      properties: [
        // https://github.com/quarrant/@override/mobx-persist-store/issues/97
        // @ts-ignore
        'contracts',
        {
          key: 'tokens',
          deserialize: (stringObject: string): this['tokens'] => {
            const value = JSON.parse(stringObject) as this['tokens'];
            const keys = Object.keys(value);
            const newValue = keys.reduce((prev, cur) => {
              return {
                ...prev,
                [AddressUtils.toEth(cur)]: value[AddressUtils.toEth(cur)].map(
                  item => ({
                    ...item,
                    value: Balance.fromJsonString(item.value),
                  }),
                ),
              };
            }, {});

            return newValue;
          },
          // @ts-ignore
          serialize: (value: this['tokens']) => {
            const keys = Object.keys(value);
            const newValue = keys.reduce((prev, cur) => {
              return {
                ...prev,
                [AddressUtils.toEth(cur)]: value[AddressUtils.toEth(cur)].map(
                  item => ({
                    ...item,
                    value: item.value.toJsonString(),
                  }),
                ),
              };
            }, {});

            return JSON.stringify(newValue);
          },
        },
        {
          // @ts-ignore
          key: 'data',
          // @ts-ignore
          deserialize: (stringObject: string): this['data'] => {
            const parsed = JSON.parse(stringObject) as this['data'];
            const keys = Object.keys(parsed);
            const newValue = keys.reduce((prev, cur) => {
              return {
                ...prev,
                [AddressUtils.toEth(cur)]: {
                  ...parsed[AddressUtils.toEth(cur)],
                  value: Balance.fromJsonString(
                    parsed[AddressUtils.toEth(cur)].value || '0x0',
                  ),
                },
              };
            }, {});

            return newValue;
          },
          // @ts-ignore
          serialize: (value: this['data']) => {
            const keys = Object.keys(value);
            const newValue = keys.reduce((prev, cur) => {
              return {
                ...prev,
                [AddressUtils.toEth(cur)]: {
                  ...value[AddressUtils.toEth(cur)],
                  value: value[AddressUtils.toEth(cur)].value.toJsonString(),
                },
              };
            }, {});
            return JSON.stringify(newValue);
          },
        },
      ],
      storage,
    });

    if (!AppStore.isRpcOnly) {
      when(
        () => Socket.lastMessage.type === 'token',
        () => this.onMessage(Socket.lastMessage),
      );
    }
  }

  get isLoading() {
    return this._isLoading;
  }

  get UNKNOWN_TOKEN() {
    return {
      name: 'UNKNOWN',
      symbol: '?',
      icon: require('@assets/images/empty-icon.png'),
      decimals: 0,
      contract_address: '',
    };
  }
  create(id: string, params: IToken) {
    const existingItem = this.getById(params.id);

    if (existingItem) {
      this.update(existingItem.id, params);
    } else {
      this.data = {
        ...this.data,
        [AddressUtils.toEth(id)]: params,
      };
    }

    return id;
  }

  remove(id: string | undefined) {
    if (!id) {
      return false;
    }
    const itemToRemove = this.getById(id);
    if (!itemToRemove) {
      return false;
    }
    const newData = {
      ...this.data,
    };
    delete newData[AddressUtils.toEth(id)];

    this.data = newData;
    return true;
  }

  removeAll() {
    this.data = {};
  }

  getAll() {
    const allowedChains = Provider.getAllNetworks().map(p =>
      Number(p.ethChainId),
    );
    return Object.values(this.data).filter(t =>
      allowedChains.includes(Number(t.chain_id)),
    );
  }

  getByAddress(address?: string) {
    try {
      if (!address) {
        return null;
      }
      return this.getAll()?.find(t => AddressUtils.equals(address, t.id));
    } catch {
      return null;
    }
  }

  getAllVisible() {
    return this.getAll().filter(item => !!item.is_in_white_list);
  }

  getAllPositive() {
    return this.getAll().filter(
      item => !!item.is_in_white_list && item.value.isPositive(),
    );
  }

  getById(id: string) {
    let token = this.data[AddressUtils.toEth(id)];

    if (!token) {
      token = Object.values(this.tokens)
        .flat()
        .find(t => t.id === id)!;
    }

    if (!token) {
      this._safeLoadUnknownToken(id);
    }

    return token;
  }

  /**
   * Load unknown token by id
   * @param id - token id
   */
  private _safeLoadUnknownToken = createAsyncTask(async (id: AddressWallet) => {
    try {
      if (!this.fetchedUnknownTokens[id]) {
        runInAction(() => {
          this.fetchedUnknownTokens[id] = true;
        });

        // find token with name, symbol, decimals and is_erc20
        const contract = await Contract.getById(id);

        if (contract) {
          runInAction(() => {
            this.data[AddressUtils.toEth(contract.id)] = {
              ...contract,
              contract_created_at: contract.created_at,
              contract_updated_at: contract.updated_at,
              value: new Balance('0x0', contract.decimals!, contract.symbol!),
              chain_id: contract.chain_id!,
              image: contract.icon
                ? {uri: contract.icon}
                : require('@assets/images/empty-icon.png'),
            };
          });
        }
      }
    } catch (e) {
      Logger.error('TokensStore: _safeLoadUnknownToken: error', {
        error: e,
        id,
      });
    }
  });

  update(id: string | undefined, item: Omit<IToken, 'id'>) {
    if (!id) {
      return false;
    }
    const itemToUpdate = this.getById(id);
    if (!itemToUpdate) {
      return false;
    }

    const updatedValue = itemToUpdate.value.operate(item.value, 'add');

    runInAction(() => {
      this.data = {
        ...this.data,
        [AddressUtils.toEth(id)]: {
          ...itemToUpdate,
          ...item,
          value: updatedValue,
        },
      };
    });

    return true;
  }

  fetchTokens = createAsyncTask(async (force = true) => {
    if (this.isLoading && !force) {
      return;
    }

    runInAction(() => {
      this._isLoading = true;
    });

    const wallets = Wallet.getAll();

    if (AppStore.isRpcOnly) {
      const _tokens = await getHardcodedTokens();
      const _data = {} as Record<AddressEthereum, IToken>;

      // logger.log('fetchTokens', _tokens);

      wallets.forEach(wallet => {
        const nativeTokens = this.generateNativeTokens(wallet);
        _tokens[wallet.address] = [...nativeTokens, ..._tokens[wallet.address]];
      });

      for await (const t of Object.values(_tokens).flat()) {
        _data[t.id] = t;
      }

      runInAction(() => {
        this.tokens = _tokens;
        this.data = {
          ...this.data,
          ..._data,
        };
        this._isLoading = false;
      });
    } else {
      const accounts = wallets.map(w => w.cosmosAddress);
      const updates = await Indexer.instance.updates(accounts, this.lastUpdate);

      const _tokens = {} as Record<AddressEthereum, IToken[]>;
      const _data = {} as Record<AddressEthereum, IToken>;

      wallets.forEach(wallet => {
        const nativeTokens = this.generateNativeTokens(wallet);
        _tokens[AddressUtils.toEth(wallet.cosmosAddress)] = [...nativeTokens];
      });

      const TRON_PROVIDER_CHAIN_IDS = Provider.getAll()
        .filter(p => p.isTron)
        .map(p => p.ethChainId as ChainId);

      const contractMap = updates.tokens.reduce(
        (prev, cur) => {
          const tokens = Array.from(
            new Set([...(prev[cur.chain_id] || []), cur.contract]),
          );
          return {
            ...prev,
            [cur.chain_id]: tokens,
          };
        },
        {} as Record<ChainId, string[]>,
      );
      await Promise.allSettled(
        Object.entries(contractMap).map(([chainId, contracts]) => {
          Contract.fetch(contracts, chainId);
        }),
      );

      for await (const t of updates.tokens) {
        try {
          const isPositive = new Balance(t.value).isPositive();
          if (!isPositive) {
            continue;
          }

          const token = await this.parseIToken(t);

          if (!token) {
            logger.error('fetchTokens: skipping token', {
              token,
            });
            continue;
          }

          const isTron = TRON_PROVIDER_CHAIN_IDS.includes(t.chain_id);

          let walletAddress = '' as AddressEthereum;

          if (isTron) {
            const w = AddressUtils.getWalletByAddress(t.address);
            if (w) {
              walletAddress = w.address;
            } else {
              walletAddress = t.address.startsWith('0x')
                ? (t.address as AddressEthereum)
                : AddressUtils.tronToHex(t.address);
            }
          } else {
            walletAddress = AddressUtils.toEth(t.address);
          }

          if (!_tokens[walletAddress]?.length) {
            const wallet = Wallet.getById(walletAddress);
            const nativeTokens = this.generateNativeTokens(wallet!);

            _tokens[walletAddress] = [...nativeTokens];
          }

          _tokens[walletAddress].push(token);
          _data[AddressUtils.toEth(token.id)] = token;
        } catch (e) {
          logger.error('fetchTokens: error during parsing tokens', {
            error: e,
            tokenAddress: t.address,
            chainId: t.chain_id,
          });
        }
      }

      runInAction(() => {
        this.tokens = _tokens;
        this.data = {
          ...this.data,
          ..._data,
        };
        this._isLoading = false;
      });
    }
  });

  private generateNativeTokens = (w: IWalletModel) => {
    if (Provider.isAllNetworks && !AppStore.isRpcOnly) {
      return Provider.getAllNetworks().map(p => this.generateNativeToken(w, p));
    }

    return [this.generateNativeToken(w)];
  };

  public generateNativeToken = (
    wallet: IWalletModel,
    provider: ProviderModel = Provider.selectedProvider,
  ): IToken => {
    const balance = Wallet.getBalance(wallet.address, 'available', provider);

    return {
      id: NATIVE_TOKEN_ADDRESS,
      contract_created_at: '',
      contract_updated_at: '',
      value: balance,
      decimals: provider.decimals,
      is_erc20: false,
      is_erc721: false,
      is_erc1155: false,
      is_in_white_list: true,
      name: provider.coinName,
      symbol: provider.denom,
      created_at: '',
      updated_at: '',
      chain_id: provider.ethChainId,
      image: provider.isHaqqNetwork
        ? require('@assets/images/islm_icon.png')
        : {uri: provider.icon},
    };
  };

  public generateNativeTokenContracts = () => {
    if (Provider.isAllNetworks) {
      return Provider.getAllNetworks().map(p =>
        this.generateNativeTokenContract(p),
      );
    }

    return [this.generateNativeTokenContract()];
  };

  public generateNativeTokenContract = (
    provider: ProviderModel = Provider.selectedProvider,
  ): IContract => {
    return {
      id: AddressUtils.toHaqq(NATIVE_TOKEN_ADDRESS),
      eth_address: AddressUtils.toEth(NATIVE_TOKEN_ADDRESS),
      address_type: AddressType.contract,
      is_skip_eth_tx: false,
      min_input_amount: '18',
      decimals: provider.decimals,
      is_erc20: false,
      is_erc721: false,
      is_erc1155: false,
      is_in_white_list: true,
      name: provider.coinName,
      symbol: provider.denom,
      created_at: '',
      updated_at: '',
      icon: provider.isHaqqNetwork
        ? require('@assets/images/islm_icon.png')
        : provider.icon,
    };
  };

  private parseIToken = async (token: IndexerToken): Promise<IToken | null> => {
    const contract = await Contract.getById(token.contract, token.chain_id);
    if (contract) {
      return {
        id: contract.id,
        contract_created_at: contract.created_at,
        contract_updated_at: contract.updated_at,
        value: new Balance(
          token.value,
          contract.decimals || Provider.selectedProvider.decimals,
          contract.symbol || Provider.selectedProvider.denom,
        ),
        decimals: contract.decimals,
        is_erc20: contract.is_erc20,
        is_erc721: contract.is_erc721,
        is_erc1155: contract.is_erc1155,
        is_in_white_list: contract.is_in_white_list,
        name: contract.name,
        symbol: contract.symbol,
        created_at: token.created_at,
        updated_at: token.updated_at,
        chain_id: token.chain_id,
        image: contract.icon
          ? {uri: contract.icon}
          : require('@assets/images/empty-icon.png'),
      } as IToken;
    }

    return null;
  };

  onMessage = async (message: RPCMessage) => {
    if (message.type !== 'token') {
      return;
    }
    const tokenData = message.data;

    const token = await this.parseIToken(tokenData);
    if (token) {
      this.update(token.id, token);
    }
  };

  clear() {
    runInAction(() => {
      this.data = {};
      this.tokens = {};
      this._isLoading = false;
    });
  }
}

const instance = new TokensStore();
export {instance as Token};

export const STATIC_TOKEN_ADDRESS: Record<
  ChainId,
  {address: string; icon?: string}[]
> = {
  // TestEdge2
  54211: [
    // AXL
    {
      address: '0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75',
      icon: 'https://github.com/cosmos/chain-registry/blob/master/axelar/images/axl.png?raw=true',
    },
    // axlUSDC
    {
      address: '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd',
      icon: 'https://github.com/cosmos/chain-registry/blob/master/osmosis/images/usdc.axl.png?raw=true',
    },
    // axlUSDC from axelar faucet
    {
      address: '0x3452e23F9c4cC62c70B7ADAd699B264AF3549C19',
      icon: 'https://github.com/cosmos/chain-registry/blob/master/osmosis/images/usdc.axl.png?raw=true',
    },
    // AXL from axelar faucet
    {
      address: '0x5db67696C3c088DfBf588d3dd849f44266ff0ffa',
      icon: 'https://github.com/cosmos/chain-registry/blob/master/axelar/images/axl.png?raw=true',
    },
  ],
  // Mainnet
  11235: [
    // axlDAI
    {
      address: '0xC5e00D3b04563950941f7137B5AfA3a534F0D6d6',
      icon: 'https://github.com/cosmos/chain-registry/blob/master/axelar/images/axldai.png?raw=true',
    },
    // OSMO
    {
      address: '0xc03345448969Dd8C00e9E4A85d2d9722d093aF8E',
      icon: 'https://github.com/cosmos/chain-registry/blob/master/osmosis/images/osmo.png?raw=true',
    },
    // axlUSDC
    {
      address: '0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd',
      icon: 'https://github.com/cosmos/chain-registry/blob/master/osmosis/images/usdc.axl.png?raw=true',
    },
    // axlUSDT
    {
      address: '0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75',
      icon: 'https://github.com/cosmos/chain-registry/blob/master/osmosis/images/usdt.axl.png?raw=true',
    },
    // ATOM
    {
      address: '0xFA3C22C069B9556A4B2f7EcE1Ee3B467909f4864',
      icon: 'https://github.com/cosmos/chain-registry/blob/master/cosmoshub/images/atom.png?raw=true',
    },
    // axlWBTC
    {
      address: '0x5FD55A1B9FC24967C4dB09C513C3BA0DFa7FF687',
      icon: 'https://github.com/cosmos/chain-registry/blob/master/axelar/images/axlwbtc.png?raw=true',
    },
    // USDC
    {
      address: '0x0CE35b0D42608Ca54Eb7bcc8044f7087C18E7717',
      icon: 'https://github.com/cosmos/chain-registry/blob/master/noble/images/USDCoin.png?raw=true',
    },
    // axlWETH
    {
      address: '0xecEEEfCEE421D8062EF8d6b4D814efe4dc898265',
      icon: 'https://github.com/cosmos/chain-registry/blob/master/axelar/images/axlweth.png?raw=true',
    },
    // AXL
    {
      address: '0x1D54EcB8583Ca25895c512A8308389fFD581F9c9',
      icon: 'https://github.com/cosmos/chain-registry/blob/master/axelar/images/axl.png?raw=true',
    },
    // wISLM
    {
      address: '0xeC8CC083787c6e5218D86f9FF5f28d4cC377Ac54',
      icon: 'https://github.com/cosmos/chain-registry/blob/master/haqq/images/islm.png?raw=true',
    },
    // DEEN
    {
      address: '0x4FEBDDe47Ab9a76200e57eFcC80b212a07b3e6cE',
      icon: 'https://github.com/cosmos/chain-registry/blob/master/haqq/images/deen.png?raw=true',
    },
    // stlISLM
    {address: '0x12fEFEAc0568503F7C0D934c149f29a42B05C48f', icon: ''},
  ],
};

export async function getHardcodedTokens(provider = Provider.selectedProvider) {
  const wallets = Wallet.addressList();
  const contracts = STATIC_TOKEN_ADDRESS[provider.ethChainId];

  if (!contracts.length) {
    return {} as IndexerTokensData;
  }

  const tokens = await Promise.all(
    wallets
      .map(async wallet => {
        return [
          wallet,
          [
            ...(
              await Promise.all(
                contracts
                  .map(async ({address, icon}) => {
                    const etherProvider = new ethers.providers.JsonRpcProvider(
                      provider.ethRpcEndpoint,
                    );
                    const contractInterface = new ethers.Contract(
                      address,
                      ERC20_ABI,
                      etherProvider,
                    );

                    const balanceResult = await contractInterface.balanceOf(
                      wallet,
                    );

                    let symbol = await contractInterface.symbol();
                    let decimals = await contractInterface.decimals();
                    let name = await contractInterface.name();

                    const balance = new Balance(
                      balanceResult,
                      decimals,
                      symbol,
                    );

                    if (!balance.isPositive()) {
                      return;
                    }

                    // todo: get image uri
                    // https://github.com/cosmos/chain-registry/tree/master/noble/images
                    // https://github.com/cosmos/chain-registry/tree/master/haqq/images
                    // https://hackmd.io/@6nuUr0-iSbe6nfJoRcuqJg/B1p_HM6Kp

                    return {
                      id: AddressUtils.toEth(address),
                      contract_created_at: '',
                      contract_updated_at: '',
                      value: balance,
                      decimals: decimals,
                      is_erc20: true,
                      is_erc721: false,
                      is_erc1155: false,
                      is_in_white_list: true,
                      chain_id: provider.ethChainId,
                      name: name,
                      symbol: symbol,
                      created_at: '',
                      updated_at: '',
                      image: icon
                        ? {uri: icon}
                        : require('@assets/images/empty-icon.png'),
                    } as IToken;
                  })
                  .filter(Boolean),
              )
            ).filter(Boolean),
          ].filter(
            // remove duplicates
            (token, index, self) =>
              self.findIndex(t => AddressUtils.equals(t?.id!, token?.id!)) ===
              index,
          ),
        ].filter(Boolean);
      })
      .filter(Boolean),
  );
  return Object.fromEntries(tokens) as IndexerTokensData;
}
