import React, {useCallback} from 'react';

import {ListRenderItem, StyleSheet} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

import {NftCollection} from '@app/types';

import {NftViewerCollectionPreview} from './nft-viewer-collection-preview';

import {Spacer} from '../ui';

export interface NftViewerCollectionPreviewListProps {
  data: NftCollection[];
  onPress(item: NftCollection): void;
  scrollEnabled?: boolean;
}

export const NftViewerCollectionPreviewList = ({
  data,
  onPress,
  scrollEnabled = true,
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
    />
  );
};

const styles = StyleSheet.create({
  columnWrapperStyle: {
    justifyContent: 'space-between',
  },
});
