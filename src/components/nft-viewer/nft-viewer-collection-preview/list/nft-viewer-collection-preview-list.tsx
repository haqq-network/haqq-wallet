import React, {useCallback, useMemo} from 'react';

import {SectionList, SectionListRenderItem} from 'react-native';

import {NftViewerSectionHeader} from '@app/components/nft-viewer/nft-viewer-collection-preview/list/nft-viewer-section-header';
import {NftViewerItemPreviewVariant} from '@app/components/nft-viewer/nft-viewer-item-preview/nft-viewer-item-preview';
import {NftViewerItemPreviewList} from '@app/components/nft-viewer/nft-viewer-item-preview/nft-viewer-item-preview-list';
import {NftSection, NftSectionData} from '@app/components/nft-viewer/types';
import {Spacer} from '@app/components/ui';
import {HaqqCosmosAddress, NftCollection, NftItem} from '@app/types';

type NftViewerCollectionPreviewListProps = {
  data: NftCollection[];
  onItemPress: (item: NftItem) => void;
  onCollectionPress: (id: HaqqCosmosAddress) => void;
};

export const NftViewerCollectionPreviewList = ({
  data,
  onItemPress,
  onCollectionPress,
}: NftViewerCollectionPreviewListProps) => {
  const sections: NftSection[] = useMemo(
    () =>
      data.map(item => ({...item, data: [{data: item.data}]}) as NftSection),
    [data],
  );

  const renderItem: SectionListRenderItem<NftSectionData> = useCallback(
    ({item: section}) => {
      return (
        <NftViewerItemPreviewList
          variant={NftViewerItemPreviewVariant.medium}
          onPress={onItemPress}
          data={section.data}
        />
      );
    },
    [onItemPress],
  );

  const renderSectionHeader = useCallback(
    ({section}: any) => {
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

  const keyExtractor = useCallback(
    (item: NftSectionData) => item.toString(),
    [],
  );

  return (
    <SectionList
      scrollEnabled={false}
      keyExtractor={keyExtractor}
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      SectionSeparatorComponent={renderSectionSeparatorComponent}
    />
  );
};
