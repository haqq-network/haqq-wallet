import React, {useCallback} from 'react';

import {observer} from 'mobx-react';
import {StyleSheet} from 'react-native';

import {NftCollectionInfoBanner} from '@app/components/nft-viewer/nft-collection-info-banner';
import {NftViewerItemPreviewList} from '@app/components/nft-viewer/nft-viewer-item-preview-list';
import {TotalValueTabNames} from '@app/components/total-value-info';
import {Spacer} from '@app/components/ui';
import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useTypedNavigation} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Nft} from '@app/models/nft';
import {HomeStackRoutes} from '@app/route-types';
import {INftWidget, NftWidgetSize} from '@app/types';

export const NftWidgetWrapper = observer(({size}: INftWidget) => {
  const navigation = useTypedNavigation();
  const nftCollections = Nft.getAllCollections();
  const allNft = Nft.getAll();

  const onPress = useCallback(() => {
    navigation.navigate(HomeStackRoutes.TotalValueInfo, {
      tab: TotalValueTabNames.nft,
    });
  }, []);

  if (
    !isFeatureEnabled(Feature.nft) ||
    !nftCollections?.length ||
    !allNft?.length
  ) {
    return null;
  }

  switch (size) {
    case NftWidgetSize.large:
      return (
        <ShadowCard disablePadding onPress={onPress}>
          <NftCollectionInfoBanner data={nftCollections} />
        </ShadowCard>
      );
    case NftWidgetSize.small:
    case NftWidgetSize.medium:
    default:
      return (
        <ShadowCard onPress={onPress} style={styles.paddingLeft}>
          <WidgetHeader
            title={getText(I18N.nftWidgetTitle)}
            lable={getText(I18N.nftWidgetItems, {
              count: String(allNft.length),
            })}
          />
          <Spacer height={8} />
          <NftViewerItemPreviewList
            variant={size || NftWidgetSize.small}
            data={allNft}
          />
        </ShadowCard>
      );
  }
});

const styles = StyleSheet.create({
  paddingLeft: {
    paddingLeft: 16,
  },
});
