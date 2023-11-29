import {makeAutoObservable, runInAction} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {Wallet} from '@app/models/wallet';
import {Indexer, IndexerUpdatesResponse} from '@app/services/indexer';
import {storage} from '@app/services/mmkv';
import {INft, IndexerNftData, MobXStore} from '@app/types';

class NftStore implements MobXStore<INft> {
  /**
   * All Nft available for all wallets with commulative value
   * @key Token contract address
   * @value INft
   */
  data: Record<string, INft> = {};
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

  create(nft: INft) {
    const existingItem = this.getById(nft.id);

    if (existingItem) {
      this.update(nft);
    } else {
      this.data = {
        ...this.data,
        [nft.id]: nft,
      };
    }

    return nft.id;
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

  getById(id: string) {
    return this.data[id];
  }

  update(nft: INft) {
    const itemToUpdate = this.getById(nft.id);
    if (!itemToUpdate) {
      return false;
    }

    this.data = {
      ...this.data,
      [nft.id]: {
        ...itemToUpdate,
        ...nft,
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

      const nfts = data.nfts.map(nft => ({id: nft.token_id, ...nft}));

      return {...acc, [w.address]: [...nfts]};
    }, {});
  };
}

const instance = new NftStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Nft};
