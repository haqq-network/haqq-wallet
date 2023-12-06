import React, {useCallback} from 'react';

import {observer} from 'mobx-react';
import {StyleSheet} from 'react-native';

import {NftCollectionInfoBanner} from '@app/components/nft-viewer/nft-collection-info-banner';
import {NftViewerItemPreviewVariant} from '@app/components/nft-viewer/nft-viewer-item-preview/nft-viewer-item-preview';
import {NftViewerItemPreviewList} from '@app/components/nft-viewer/nft-viewer-item-preview/nft-viewer-item-preview-list';
import {TotalValueTabNames} from '@app/components/total-value-info';
import {Spacer} from '@app/components/ui';
import {ShadowCard} from '@app/components/ui/shadow-card';
import {WidgetHeader} from '@app/components/ui/widget-header';
import {Feature, isFeatureEnabled} from '@app/helpers/is-feature-enabled';
import {useTypedNavigation} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {Nft} from '@app/models/nft';
import {INftWidget, NftWidgetSize} from '@app/types';

export const NftWidgetWrapper = observer(({size}: INftWidget) => {
  const navigation = useTypedNavigation();
  const onPress = useCallback(() => {
    navigation.navigate('totalValueInfo', {
      tab: TotalValueTabNames.nft,
    });
  }, []);

  const allNft = Nft.getAll();

  if (!isFeatureEnabled(Feature.nft) || !allNft.length) {
    return null;
  }

  switch (size) {
    case NftWidgetSize.small:
    case NftWidgetSize.medium:
      return (
        <ShadowCard
          onPress={onPress}
          style={[styles.wrapper, styles.paddingLeft]}>
          <WidgetHeader
            title={getText(I18N.nftWidgetTitle)}
            lable={getText(I18N.nftWidgetItems, {
              count: String(allNft.length),
            })}
          />
          <Spacer height={8} />
          <NftViewerItemPreviewList
            scrollEnabled={false}
            variant={size as unknown as NftViewerItemPreviewVariant}
            data={allNft}
          />
        </ShadowCard>
      );
    case NftWidgetSize.large:
      return (
        <ShadowCard disablePadding onPress={onPress} style={styles.wrapper}>
          <NftCollectionInfoBanner data={allNft} />
        </ShadowCard>
      );
    default:
      return null;
  }
});

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
  },
  paddingLeft: {
    paddingLeft: 16,
  },
});
