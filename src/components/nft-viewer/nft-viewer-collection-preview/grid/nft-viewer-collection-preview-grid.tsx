import React, {useCallback} from 'react';

import {FlatListProps, ListRenderItem, StyleSheet} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

import {Spacer} from '@app/components/ui';
import {HaqqCosmosAddress, NftCollection} from '@app/types';

import {NftViewerCollectionPreview} from '../nft-viewer-collection-preview';

export type NftViewerCollectionPreviewGridProps = {
  data: NftCollection[];

  onPress(collectionId: HaqqCosmosAddress): void;
} & Pick<FlatListProps<any>, 'ListHeaderComponent'>;

export const NftViewerCollectionPreviewGrid = ({
  data,
  onPress,
  ListHeaderComponent,
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
      scrollEnabled={false}
      columnWrapperStyle={styles.columnWrapperStyle}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
};

const styles = StyleSheet.create({
  columnWrapperStyle: {
    justifyContent: 'space-between',
  },
});
