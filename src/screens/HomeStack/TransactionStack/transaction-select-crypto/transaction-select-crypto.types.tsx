export enum TransactionSelectCryptoAssetType {
  Crypto = 'crypto',
  NFT = 'nft',
}

export type TransactionSelectCryptoSelectAssetsProps = {
  assetType: TransactionSelectCryptoAssetType;
  onChange: (assetType: TransactionSelectCryptoAssetType) => void;
};
