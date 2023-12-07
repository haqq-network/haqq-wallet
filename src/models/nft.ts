import {makeAutoObservable, runInAction} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {Contracts} from '@app/models/contracts';
import {Wallet} from '@app/models/wallet';
import {Indexer, IndexerUpdatesResponse} from '@app/services/indexer';
import {storage} from '@app/services/mmkv';
import {
  HaqqCosmosAddress,
  IContract,
  IndexerNftData,
  MobXStore,
  NftCollection,
  NftItem,
} from '@app/types';

class NftStore implements MobXStore<NftItem> {
  /**
   * All Nft available for all wallets with commulative value
   * @key Token contract address
   * @value INft
   */
  data: Record<string, NftItem> = {};
  /**
   * Indexer response with token info
   * @key Wallet address
   * @value Array of Nft for this wallet address
   */
  Nft: IndexerNftData = {};
  private lastUpdate = new Date(0);

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        properties: [
          // https://github.com/quarrant/mobx-persist-store/issues/97
          // @ts-ignore
          'nfts',
        ],
        storage: storage,
      });
    }
  }

  create(item: NftItem) {
    const existingItem = this.getById(item.id);
    if (existingItem) {
      this.update(item);
    } else {
      this.data = {
        ...this.data,
        [item.id]: item,
      };
    }

    return item.id;
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
    delete newData[id];

    this.data = newData;
    return true;
  }

  removeAll() {
    this.data = {};
  }

  getAll() {
    return Object.values(this.data);
  }

  getAllCollections(): NftCollection[] {
    return Object.values(this.data).reduce((acc, item) => {
      let collectionIndex = acc.findIndex(col => col.id === item.contract);

      if (collectionIndex !== -1) {
        acc[collectionIndex].data.push(item);
      } else {
        acc.push({
          ...this.getContract(item.contract),
          data: [item],
        });
      }

      return acc;
    }, [] as NftCollection[]);
  }

  getCollectionById(id: HaqqCosmosAddress): NftCollection {
    return Object.values(this.data).reduce((acc, item) => {
      if (!acc.id) {
        acc = {
          ...this.getContract(item.contract),
          data: [],
        };
      }

      if (item.contract === id) {
        acc.data.push(item);
      }

      return acc;
    }, {} as NftCollection);
  }

  getById(id: string) {
    return this.data[id];
  }

  update(item: NftItem) {
    const itemToUpdate = this.getById(item.id);
    if (!itemToUpdate) {
      return false;
    }

    this.data = {
      ...this.data,
      [item.id]: {
        ...itemToUpdate,
        ...item,
      },
    };
    return true;
  }

  fetchNft = async () => {
    const wallets = Wallet.getAll();
    const accounts = wallets.map(w => w.cosmosAddress);
    const updates = await Indexer.instance.updates(accounts, this.lastUpdate);
    const result = this.parseIndexerNft(wallets, updates);

    runInAction(() => {
      this.Nft = result;
      Logger.log('nfts', JSON.stringify(this.data, null, 2));
      Logger.log('NftIndexer', JSON.stringify(this.Nft, null, 2));
    });
  };

  private parseIndexerNft = (
    wallets: Wallet[],
    data: IndexerUpdatesResponse,
  ): IndexerNftData => {
    return wallets.reduce((acc, w) => {
      if (!Array.isArray(data.nfts)) {
        return {...acc, [w.address]: []};
      }

      const nfts = data.nfts.map(item => {
        const hasCache = this.hasContractCache(item.contract);
        if (!hasCache) {
          const contract = data.addresses.find(({id}) => id === item.contract);
          this.saveContract(contract);
        }

        // We saved contract in cache on previous step
        const contract = this.getContract(item.contract);

        const nftItem: NftItem = {
          id: `${contract.id}_${item.token_id}`,
          contract: item.contract,
          address: item.address,
          name: item.name,
          description: item.description,
          created_at: item.created_at,
          price: '100',
          image: item.cached_url ?? 'https://i.ibb.co/9VGgYqf/10.jpg',
        };
        this.create(nftItem);
        return nftItem;
      });

      return {...acc, [w.address]: [...nfts]};
    }, {});
  };

  private hasContractCache = (id: HaqqCosmosAddress) => {
    return !!Contracts.getById(id);
  };

  private saveContract = (contract: IContract | undefined) => {
    if (!contract) {
      return;
    }

    Contracts.create(contract.id, contract);
  };

  private getContract = (id: HaqqCosmosAddress) => {
    return Contracts.getById(id);
  };
}

const instance = new NftStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Nft};
