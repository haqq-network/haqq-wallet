import React, {useCallback} from 'react';

import {FlatListProps, ListRenderItem, StyleSheet} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

import {NftCollection} from '@app/types';

import {NftViewerCollectionPreview} from './nft-viewer-collection-preview';

import {Spacer} from '../ui';

export type NftViewerCollectionPreviewListProps = {
  data: NftCollection[];
  scrollEnabled?: boolean;

  onPress(item: NftCollection): void;
} & Pick<FlatListProps<any>, 'ListHeaderComponent'>;

export const NftViewerCollectionPreviewList = ({
  data,
  onPress,
  scrollEnabled = true,
  ListHeaderComponent,
}: NftViewerCollectionPreviewListProps) => {
  const keyExtractor = useCallback((item: NftCollection) => item.address, []);

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
      keyExtractor={keyExtractor}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={renderItemSeparatorComponent}
      renderItem={renderItem}
      scrollEnabled={scrollEnabled}
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
