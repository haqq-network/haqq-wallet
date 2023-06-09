import {NftItem} from '@app/types';

import {NftViewerItemPreviewLarge} from './nft-viewer-item-preview-large';
import {NftViewerItemPreviewMedium} from './nft-viewer-item-preview-medium';

export enum NftViewerItemPreviewVariant {
  medium,
  large,
}

export interface NftViewerItemPreviewExtendedProps {
  item: NftItem;

  onPress(item: NftItem): void;
}

export type NftViewerItemPreviewProps = NftViewerItemPreviewExtendedProps & {
  variant: NftViewerItemPreviewVariant;
};

export const NftViewerItemPreview = ({
  variant,
  ...props
}: NftViewerItemPreviewProps) => {
  switch (variant) {
    case NftViewerItemPreviewVariant.medium:
      return <NftViewerItemPreviewMedium {...props} />;
    case NftViewerItemPreviewVariant.large:
      return <NftViewerItemPreviewLarge {...props} />;
    default:
      return null;
  }
};
