import {makeAutoObservable, runInAction} from 'mobx';

import {AddressUtils} from '@app/helpers/address-utils';
import {Whitelist} from '@app/helpers/whitelist';
import {Contracts} from '@app/models/contracts';
import {
  ContractType,
  NftCollection,
  NftCollectionIndexer,
  NftItem,
} from '@app/models/nft';
import {Wallet} from '@app/models/wallet';
import {Indexer} from '@app/services/indexer';
import {HaqqCosmosAddress, IContract} from '@app/types';

class NftStore {
  data: Record<HaqqCosmosAddress, NftCollection> = {};

  constructor() {
    makeAutoObservable(this);
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

  getCollectionsByWallet(address: HaqqCosmosAddress): NftCollection[] {
    return Object.keys(this.data).reduce((acc, key) => {
      const collection = this.data[key as HaqqCosmosAddress];
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
    Logger.log('NFTs', JSON.stringify(this.data, null, 2));
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
    });
  };

  private parseIndexerNft = (data: NftCollectionIndexer[]): void => {
    this.data = {};

    runInAction(() => {
      data.forEach(async item => {
        const contractAddress = AddressUtils.toHaqq(item.address);
        const contract = (this.getContract(contractAddress) ||
          (await Whitelist.verifyAddress(item.address)) ||
          {}) as IContract;
        const hasCache = this.hasContractCache(contractAddress);
        if (!hasCache) {
          this.saveContract(contract);
        }

        const contractType = contract.is_erc721
          ? ContractType.erc721
          : ContractType.erc1155;

        this.data[item.id] = {
          ...item,
          description: item.description || '',
          created_at: Date.now(),
          contractType: contractType,
          is_transfer_prohibinden: Boolean(contract.is_transfer_prohibinden),
          nfts: item.nfts.map(nft => ({
            ...nft,
            contractType: contractType,
            name: nft.name || 'Unknown',
            description: nft.description || '-',
            tokenId: Number(nft.token_id),
            price: undefined, // FIXME Calculate price by token
            is_transfer_prohibinden: Boolean(contract.is_transfer_prohibinden),
          })),
        };
      });
    });
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

const instance = new NftStore();
export {instance as Nft};
