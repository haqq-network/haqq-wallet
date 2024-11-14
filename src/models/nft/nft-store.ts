import {makeAutoObservable, runInAction, when} from 'mobx';

import {
  ContractType,
  NftCollection,
  NftCollectionIndexer,
  NftItem,
  NftItemIndexer,
} from '@app/models/nft';
import {Socket} from '@app/models/socket';
import {Wallet} from '@app/models/wallet';
import {Indexer} from '@app/services/indexer';
import {AddressCosmosHaqq, IContract} from '@app/types';
import {RPCMessage} from '@app/types/rpc';

import {ALL_NETWORKS_ID, Provider} from '../provider';

class NftStore {
  data: Record<AddressCosmosHaqq, NftCollection> = {};

  constructor() {
    makeAutoObservable(this);

    when(
      () => Socket.lastMessage.type === 'nft',
      () => this.onMessage(Socket.lastMessage),
    );
  }

  create(item: NftItem) {
    const existingCollection = this.getCollectionById(item.contract);
    const existingNft = this.getNftById(item.contract, item.tokenId);

    if (existingNft) {
      this.update(item);
    } else {
      this.data = {
        ...this.data,
        [item.contract]: {
          ...(existingCollection ?? {}),
          nfts: [...(existingCollection?.nfts ?? []), item],
        },
      };
    }

    return item.address;
  }

  getCollectionById(contractAddress: AddressCosmosHaqq): NftCollection | null {
    return this.data[contractAddress] ?? null;
  }

  getCollectionsByWallet(address: AddressCosmosHaqq): NftCollection[] {
    return Object.keys(this.data).reduce((acc, key) => {
      const collection = this.data[key as AddressCosmosHaqq];
      const filteredNfts = collection.nfts.filter(
        nft => nft.address === address,
      );

      if (filteredNfts.length) {
        acc.push({
          ...collection,
          nfts: filteredNfts,
        });
      }

      return acc;
    }, [] as NftCollection[]);
  }

  getNftById(
    nftContractAddress: AddressCosmosHaqq,
    nftId: number,
  ): NftItem | null {
    let nftItem: NftItem | null = null;

    for (const [_, collection] of Object.entries(this.data)) {
      for (const nft of collection.nfts) {
        if (nft.contract === nftContractAddress && nft.tokenId === nftId) {
          nftItem = nft;
          break;
        }
      }
      if (nftItem) {
        break;
      }
    }

    return nftItem;
  }

  getAll() {
    return Object.values(this.data)
      .reduce((acc: NftItem[], item) => [...acc, ...item.nfts], [])
      .sort(
        (nft1, nft2) =>
          new Date(nft2.created_at).getTime() -
          new Date(nft1.created_at).getTime(),
      );
  }

  getAllCollections() {
    return Object.values(this.data).reduce(
      (acc: NftCollection[], item) => [...acc, item],
      [],
    );
  }

  update(item: NftItem) {
    const itemToUpdate = this.getNftById(item.contract, item.tokenId);

    const existingCollection = this.getCollectionById(item.contract);

    if (!existingCollection) {
      this.fetchNft();
    } else {
      const existingNftIndex =
        existingCollection?.nfts.findIndex(
          nft => nft.tokenId === itemToUpdate?.tokenId,
        ) ?? -1;

      const newItem = {
        ...(itemToUpdate ?? {}),
        ...item,
      };

      const nfts =
        existingNftIndex !== -1
          ? (existingCollection?.nfts ?? []).splice(
              existingNftIndex,
              1,
              newItem,
            )
          : [newItem];

      this.data = {
        ...this.data,
        [item.contract]: {
          ...(existingCollection ?? {}),
          nfts,
        },
      };
    }

    return true;
  }

  fetchNft = async () => {
    const wallets = Wallet.getAll();
    const accounts = wallets.map(w => w.cosmosAddress);
    const nfts = await Indexer.instance.getNfts(accounts);

    this.parseIndexerNfts(nfts);
  };

  private parseIndexerNfts = (data: NftCollectionIndexer[]): void => {
    this.data = {};

    data.forEach(async item => {
      const contract = await this.getContract(item.address);
      const contractType = contract.is_erc721
        ? ContractType.erc721
        : ContractType.erc1155;

      runInAction(() => {
        this.data[item.id] = {
          ...item,
          description: item.description || '',
          created_at: Date.now(),
          contractType: contractType,
          is_transfer_prohibinden: Boolean(contract.is_transfer_prohibinden),
          nfts: item.nfts.map(nft => this.parseIndexerNft(nft, contract)),
        };
      });
    });
  };

  private readonly getContract = async (contractAddress: string) => {
    const _providerEthChainId = (
      Provider.selectedProviderId === ALL_NETWORKS_ID
        ? Provider.defaultProvider
        : Provider.selectedProvider
    ).ethChainId;

    const contracts = await Indexer.instance.getAddresses({
      [_providerEthChainId]: [contractAddress],
    });
    return contracts[_providerEthChainId][0];
  };

  private readonly parseIndexerNft = (
    data: NftItemIndexer,
    contract: IContract,
  ): NftItem => {
    const contractType = contract.is_erc721
      ? ContractType.erc721
      : ContractType.erc1155;

    return {
      ...data,
      contractType: contractType,
      name: data.name || 'Unknown',
      description: data.description || '-',
      tokenId: Number(data.token_id),
      price: undefined, // FIXME Calculate price by token
      is_transfer_prohibinden: Boolean(contract.is_transfer_prohibinden),
    };
  };

  onMessage = async (message: RPCMessage) => {
    if (message.type !== 'nft') {
      return;
    }

    const contract = await this.getContract(message.data.contract);
    this.update(this.parseIndexerNft(message.data, contract));
  };

  clear() {
    runInAction(() => {
      this.data = {};
    });
  }
}

const instance = new NftStore();
export {instance as Nft};
