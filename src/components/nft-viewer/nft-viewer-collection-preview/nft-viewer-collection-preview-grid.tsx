import React, {useCallback} from 'react';

import {ListRenderItem, StyleSheet} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

import {HaqqCosmosAddress, NftCollection} from '@app/types';

import {NftViewerCollectionPreview} from './nft-viewer-collection-preview';

import {Spacer} from '../../ui';

export interface NftViewerCollectionPreviewGridProps {
  data: NftCollection[];
  scrollEnabled?: boolean;

  onPress(collectionId: HaqqCosmosAddress): void;
}

export const NftViewerCollectionPreviewGrid = ({
  data,
  onPress,
  scrollEnabled = true,
}: NftViewerCollectionPreviewGridProps) => {
  const renderItemSeparatorComponent = useCallback(
    () => <Spacer width={12} height={12} />,
    [],
  );

  const renderItem: ListRenderItem<NftCollection> = useCallback(
    ({item}) => <NftViewerCollectionPreview item={item} onPress={onPress} />,
    [onPress],
  );

  return (
    <FlatList
      data={data}
      numColumns={2}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={renderItemSeparatorComponent}
      renderItem={renderItem}
      scrollEnabled={scrollEnabled}
      columnWrapperStyle={styles.columnWrapperStyle}
    />
  );
};

const styles = StyleSheet.create({
  columnWrapperStyle: {
    justifyContent: 'space-between',
  },
});
