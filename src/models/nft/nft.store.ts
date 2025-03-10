import {makeAutoObservable, runInAction, when} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

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
import {storage} from '@app/services/mmkv';
import {AddressCosmosHaqq} from '@app/types';
import {RPCMessage} from '@app/types/rpc';

import {AppStore} from '../app';
import {Contract, IndexerContract} from '../contract';

class NftStore {
  data: Record<AddressCosmosHaqq, NftCollection> = {};

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: this.constructor.name,
      properties: ['data'],
      storage,
    });

    if (!AppStore.isRpcOnly) {
      when(
        () => Socket.lastMessage.type === 'nft',
        () => this.onMessage(Socket.lastMessage),
      );
    }
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

  update(item: NftItem | null) {
    if (item) {
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

    return false;
  }

  fetchNft = async () => {
    const wallets = Wallet.getAll();
    const accounts = wallets.map(w => w.cosmosAddress);
    const nfts = await Indexer.instance.getNfts(accounts);

    this.parseIndexerNfts(nfts);
  };

  private parseIndexerNfts = (data: NftCollectionIndexer[]): void => {
    data.forEach(async item => {
      const contract = await Contract.getById(item.address, item.chain_id);

      const tmpData: typeof this.data = {};
      if (contract) {
        const contractType = contract.is_erc721
          ? ContractType.erc721
          : ContractType.erc1155;

        tmpData[item.id] = {
          ...item,
          description: item.description || '',
          created_at: Date.now(),
          contractType: contractType,
          is_transfer_prohibinden: Boolean(contract.is_transfer_prohibinden),
          nfts: item.nfts
            .map(nft => this.parseIndexerNft(nft, contract))
            .filter(i => i !== null),
        };
      }

      runInAction(() => {
        this.data = {
          ...this.data,
          ...tmpData,
        };
      });
    });
  };

  private readonly parseIndexerNft = (
    data: NftItemIndexer,
    contract: IndexerContract | null,
  ): NftItem | null => {
    if (contract) {
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
    }

    return null;
  };

  onMessage = async (message: RPCMessage) => {
    if (message.type !== 'nft') {
      return;
    }

    const contract = await Contract.getById(
      message.data.contract,
      message.data.chain_id,
    );
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
