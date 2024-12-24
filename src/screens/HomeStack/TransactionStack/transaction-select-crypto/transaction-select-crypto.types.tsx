import {ProviderModel} from '@app/models/provider';

export enum TransactionSelectCryptoAssetType {
  Crypto = 'crypto',
  NFT = 'nft',
}

export type TransactionSelectCryptoSelectAssetsProps = {
  assetType: TransactionSelectCryptoAssetType;
  onChange: (assetType: TransactionSelectCryptoAssetType) => void;
};

export type TransactionSelectCryptoSelectNetworkProps = {
  selectedProvider: ProviderModel;
  onChange: (provider: ProviderModel) => void;
};
