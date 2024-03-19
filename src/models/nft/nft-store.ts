import {makeAutoObservable, runInAction} from 'mobx';
import {makePersistable} from 'mobx-persist-store';

import {NftCollection, NftCollectionIndexer, NftItem} from '@app/models/nft';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Indexer} from '@app/services/indexer';
import {storage} from '@app/services/mmkv';
import {HaqqCosmosAddress} from '@app/types';

class NftStore {
  data: Record<HaqqCosmosAddress, NftCollection> = {};

  constructor(shouldSkipPersisting: boolean = false) {
    makeAutoObservable(this);
    if (!shouldSkipPersisting) {
      makePersistable(this, {
        name: this.constructor.name,
        properties: ['data'],
        storage: storage,
      });
    }
  }

  create(item: NftItem) {
    const existingCollection = this.getCollectionById(item.contract);
    const existingNft = this.getNftById(item.contract);

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

  getCollectionById(contractAddress: HaqqCosmosAddress): NftCollection | null {
    return this.data[contractAddress] ?? null;
  }

  getNftById(nftAddress: HaqqCosmosAddress): NftItem | null {
    let nftItem: NftItem | null = null;

    for (const [_, collection] of Object.entries(this.data)) {
      for (const nft of collection.nfts) {
        if (nft.address === nftAddress) {
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
    return Object.values(this.data).reduce(
      (acc: NftItem[], item) => [...acc, ...item.nfts],
      [],
    );
  }

  getAllCollections() {
    return Object.values(this.data).reduce(
      (acc: NftCollection[], item) => [...acc, item],
      [],
    );
  }

  update(item: NftItem, existingItem?: NftItem | null) {
    const itemToUpdate = existingItem ?? this.getNftById(item.address);
    if (!itemToUpdate) {
      return false;
    }

    const existingCollection = this.getCollectionById(item.contract);
    const existingNftIndex =
      existingCollection?.nfts.findIndex(
        nft => nft.address === itemToUpdate.address,
      ) ?? -1;

    const newItem = {
      ...itemToUpdate,
      ...item,
    };

    const nfts =
      existingNftIndex !== -1
        ? (existingCollection?.nfts ?? []).splice(existingNftIndex, 1, newItem)
        : [];

    this.data = {
      ...this.data,
      [item.contract]: {
        ...(existingCollection ?? {}),
        nfts,
      },
    };
    return true;
  }

  fetchNft = async () => {
    const wallets = Wallet.getAll();
    const accounts = wallets.map(w => w.cosmosAddress);
    const nfts = await Indexer.instance.getNfts(accounts);

    runInAction(() => {
      this.parseIndexerNft(nfts);
      Logger.log('nfts', JSON.stringify(this.data, null, 2));
    });
  };

  private parseIndexerNft = (data: NftCollectionIndexer[]): void => {
    data.forEach(item => {
      this.data[item.id] = {
        ...item,
        nfts: item.nfts.map(nft => ({
          ...nft,
          price: nft.price ? new Balance(nft.price) : Balance.getEmpty(),
        })),
      };
    });
  };
}

const instance = new NftStore(Boolean(process.env.JEST_WORKER_ID));
export {instance as Nft};
