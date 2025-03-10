import {AddressUtils} from '@app/helpers/address-utils';
import {
  NftAttribute,
  NftCollectionIndexer,
  NftItemIndexer,
} from '@app/models/nft';
import {AddressEthereum} from '@app/types';

import {explorerFetch} from './explorer-fetch';

export async function fetchWalletNftBatch(
  addresses: string[],
): Promise<NftCollectionIndexer[]> {
  const collections = (
    await Promise.all(
      addresses.map(async a => {
        try {
          return await fetchWalletNft(a);
        } catch {
          return undefined;
        }
      }),
    )
  ).filter(c => !!c);

  if (addresses.length === 1) {
    return collections.flat();
  }

  const collectionsMap: Record<string, NftCollectionIndexer> = {};
  collections.forEach(c => {
    c.forEach(collection => {
      if (collectionsMap[collection.id]) {
        collectionsMap[collection.id].nfts.push(...collection.nfts);
      } else {
        collectionsMap[collection.id] = collection;
      }
    });
  });

  return Object.values(collectionsMap);
}

export async function fetchWalletNft(
  walletAddress: string,
): Promise<NftCollectionIndexer[]> {
  // Step 1: Fetch all NFT collections for the wallet
  const collectionsResult = await fetchAllCollections(walletAddress);

  // Step 2: Fetch all NFTs for the wallet
  const nftsResult = await fetchAllNfts(walletAddress);

  // Step 3: Group NFTs by their collection (contract)
  const nftsByContract = groupNftsByContract(nftsResult);

  // Step 4: Map collections and add their NFTs
  return mapCollectionsWithNfts(
    collectionsResult,
    nftsByContract,
    walletAddress,
  );
}

// Helper function to fetch all collections with pagination
async function fetchAllCollections(walletAddress: string): Promise<any[]> {
  let collections: any[] = [];
  let hasNextPage = true;
  let nextPageParams: any = null;

  while (hasNextPage) {
    let url = `addresses/${walletAddress}/nft/collections`;
    if (nextPageParams) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(nextPageParams)) {
        params.append(key, String(value));
      }
      url += `?${params.toString()}`;
    }

    const data = await explorerFetch<any>(url, {useApiV2: true});
    collections = [...collections, ...data.items];

    // Check if there are more pages
    if (data.next_page_params) {
      nextPageParams = data.next_page_params;
    } else {
      hasNextPage = false;
    }
  }

  return collections;
}

// Helper function to fetch all NFTs with pagination
async function fetchAllNfts(walletAddress: string): Promise<any[]> {
  const baseUrl = `https://explorer.haqq.network/api/v2//addresses/${walletAddress}/nft`;
  let nfts: any[] = [];
  let hasNextPage = true;
  let nextPageParams: any = null;

  while (hasNextPage) {
    let url = baseUrl;
    if (nextPageParams) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(nextPageParams)) {
        params.append(key, String(value));
      }
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch NFTs: ${response.statusText}`);
    }

    const data = await response.json();
    nfts = [...nfts, ...data.items];

    // Check if there are more pages
    if (data.next_page_params) {
      nextPageParams = data.next_page_params;
    } else {
      hasNextPage = false;
    }
  }

  return nfts;
}

// Group NFTs by their contract address
function groupNftsByContract(nfts: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};

  nfts.forEach(nft => {
    const contractAddress = nft.token.address;
    if (!grouped[contractAddress]) {
      grouped[contractAddress] = [];
    }
    grouped[contractAddress].push(nft);
  });

  return grouped;
}

// Map the collections data to the required output format
function mapCollectionsWithNfts(
  collections: any[],
  nftsByContract: Record<string, any[]>,
  walletAddress: string,
): NftCollectionIndexer[] {
  return collections.map(collection => {
    const contractAddress = collection.token.address;
    const collectionNfts = nftsByContract[contractAddress] || [];

    return {
      address: contractAddress as AddressEthereum,
      description: collection.metadata?.description || '',
      external_url: collection.metadata?.external_url || '',
      chain_id: collection.token?.chain_id || 0,
      id: AddressUtils.toHaqq(contractAddress),
      image: collection.metadata?.image_url || collection.image_url || '',
      name: collection.metadata?.name || collection.token?.name || '',
      symbol: collection.token?.symbol || '',
      created_at: convertTimeToNumber(collection.created_at) || 0,
      nfts: collectionNfts.map(nft =>
        mapNftToNftItemIndexer(nft, walletAddress),
      ),
    };
  });
}

// Map a single NFT to the NftItemIndexer type
function mapNftToNftItemIndexer(
  nft: any,
  walletAddress: string,
): NftItemIndexer {
  return {
    address: AddressUtils.toHaqq(walletAddress),
    amount: parseInt(nft.value, 10) || 1,
    attributes: mapAttributes(nft.metadata?.attributes),
    block: nft.block || 0,
    cached_url: nft.image_url || null,
    contract: AddressUtils.toHaqq(nft.token.address),
    created_at: nft.created_at || new Date().toISOString(),
    description: nft.metadata?.description || null,
    file_type: determineFileType(nft.image_url, nft.animation_url),
    hash: nft.id || '',
    is_failed: false,
    is_link_checked: !!nft.image_url,
    is_name_checked: !!nft.metadata?.name,
    metadata: nft.metadata || null,
    name: nft.metadata?.name || `Token #${nft.id}`,
    original_url: nft.animation_url || nft.image_url || null,
    token_id: nft.id || '',
    updated_at: nft.updated_at || new Date().toISOString(),
    properties: nft.metadata?.properties || null,
    chain_id: nft.chain_id || 0,
  };
}

// Helper function to map NFT attributes
function mapAttributes(attributes: any[] | undefined): NftAttribute[] | null {
  if (!attributes || !Array.isArray(attributes)) {
    return null;
  }

  return attributes.map(attr => ({
    trait_type: attr.trait_type || '',
    value: attr.value || '',
    display_type: attr.display_type || '',
  }));
}

// Helper function to determine file type from URLs
function determineFileType(
  imageUrl: string | undefined,
  animationUrl: string | undefined,
): string | null {
  if (animationUrl) {
    const extension = animationUrl.split('.').pop()?.toLowerCase();
    if (extension === 'mp4' || extension === 'webm') {
      return 'video';
    }
    if (extension === 'mp3' || extension === 'wav') {
      return 'audio';
    }
    if (extension === 'gif') {
      return 'gif';
    }
  }

  if (imageUrl) {
    const extension = imageUrl.split('.').pop()?.toLowerCase();
    if (extension === 'png') {
      return 'png';
    }
    if (extension === 'jpg' || extension === 'jpeg') {
      return 'jpeg';
    }
    if (extension === 'svg') {
      return 'svg';
    }
    if (extension === 'gif') {
      return 'gif';
    }
  }

  return null;
}

// Helper function to convert ISO time string to number (timestamp)
function convertTimeToNumber(timeString: string | undefined): number {
  if (!timeString) {
    return Date.now();
  }
  return new Date(timeString).getTime();
}
