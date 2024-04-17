import React from 'react';

import {observer} from 'mobx-react';

import {NftViewerItemPreviewList} from '@app/components/nft-viewer/nft-viewer-item-preview-list';
import {Spacer} from '@app/components/ui';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {I18N, getText} from '@app/i18n';
import {Nft} from '@app/models/nft';
import {NftWidgetSize} from '@app/types';

export const NftListView = observer(() => {
  const allNft = Nft.getAll();

  if (!allNft.length) {
    return null;
  }

  return (
    <>
      <WidgetHeader
        title={getText(I18N.nftWidgetTitle)}
        lable={getText(I18N.nftWidgetItems, {
          count: String(allNft.length),
        })}
      />
      <Spacer height={8} />
      <NftViewerItemPreviewList variant={NftWidgetSize.small} data={allNft} />
    </>
  );
});
