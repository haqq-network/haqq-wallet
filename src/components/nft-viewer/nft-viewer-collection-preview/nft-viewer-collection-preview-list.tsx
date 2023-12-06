import React, {useCallback} from 'react';

import {SectionList, SectionListRenderItem} from 'react-native';

import {NftViewerItemPreviewVariant} from '@app/components/nft-viewer/nft-viewer-item-preview/nft-viewer-item-preview';
import {NftViewerItemPreviewList} from '@app/components/nft-viewer/nft-viewer-item-preview/nft-viewer-item-preview-list';
import {NftViewerSectionHeader} from '@app/components/nft-viewer/nft-viewer-section-header';
import {Spacer} from '@app/components/ui';
import {NftCollection, NftItem} from '@app/types';

type NftViewerCollectionPreviewListProps = {
  data: NftCollection[];
  scrollEnabled: boolean;
  onItemPress: (item: NftItem) => void;
  onCollectionPress: (item: NftCollection) => void;
};

export const NftViewerCollectionPreviewList = ({
  data,
  scrollEnabled,
  onItemPress,
  onCollectionPress,
}: NftViewerCollectionPreviewListProps) => {
  const keyExtractor = useCallback((item: NftCollection) => item.id, []);

  const renderItem: SectionListRenderItem<NftCollection> = useCallback(
    ({item: section}) => (
      <NftViewerItemPreviewList
        variant={NftViewerItemPreviewVariant.medium}
        onPress={onItemPress}
        data={section.data}
      />
    ),
    [onItemPress],
  );

  const renderSectionHeader = useCallback(
    ({section}: any) => {
      // console.log('=====>', section);
      return (
        <NftViewerSectionHeader item={section} onPress={onCollectionPress} />
      );
    },
    [onCollectionPress],
  );

  const renderSectionSeparatorComponent = useCallback(
    () => <Spacer height={28} />,
    [],
  );

  return (
    <SectionList
      scrollEnabled={scrollEnabled}
      //@ts-ignore
      sections={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      SectionSeparatorComponent={renderSectionSeparatorComponent}
    />
  );
};
