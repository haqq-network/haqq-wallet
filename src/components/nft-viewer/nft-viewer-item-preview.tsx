import {NftItem} from '@app/models/nft';
import {NftWidgetSize} from '@app/types';

import {NftViewerItemPreviewLarge} from './nft-viewer-item-preview-large';
import {NftViewerItemPreviewMedium} from './nft-viewer-item-preview-medium';
import {NftViewerItemPreviewSmall} from './nft-viewer-item-preview-small';

export interface NftViewerItemPreviewExtendedProps {
  item: NftItem;

  onPress?(item: NftItem): void;
}

export type NftViewerItemPreviewProps = NftViewerItemPreviewExtendedProps & {
  variant: NftWidgetSize;
};

export const NftViewerItemPreview = ({
  variant,
  ...props
}: NftViewerItemPreviewProps) => {
  switch (variant) {
    case NftWidgetSize.small:
      return <NftViewerItemPreviewSmall {...props} />;
    case NftWidgetSize.medium:
      return <NftViewerItemPreviewMedium {...props} />;
    case NftWidgetSize.large:
      return <NftViewerItemPreviewLarge {...props} />;
    default:
      return null;
  }
};
