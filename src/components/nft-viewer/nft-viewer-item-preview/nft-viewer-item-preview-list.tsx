import React, {useCallback} from 'react';

import {ListRenderItem, StyleSheet} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

import {Spacer} from '@app/components/ui';
import {NftItem} from '@app/types';

import {
  NftViewerItemPreview,
  NftViewerItemPreviewVariant,
} from './nft-viewer-item-preview';

export interface NftViewerItemPreviewListProps {
  data: NftItem[];
  variant: NftViewerItemPreviewVariant;
  scrollEnabled?: boolean;

  onPress?(item: NftItem): void;
}

export const NftViewerItemPreviewList = ({
  data,
  variant,
  scrollEnabled = true,
  onPress,
}: NftViewerItemPreviewListProps) => {
  const keyExtractor = useCallback((item: NftItem) => item.id, []);

  const renderItemSeparatorComponent = useCallback(
    () => <Spacer width={12} height={12} />,
    [],
  );

  const renderItem: ListRenderItem<NftItem> = useCallback(
    ({item}) => (
      <NftViewerItemPreview variant={variant} item={item} onPress={onPress} />
    ),
    [onPress, variant],
  );

  switch (variant) {
    case NftViewerItemPreviewVariant.small:
    case NftViewerItemPreviewVariant.medium:
      return (
        <FlatList
          data={data}
          horizontal
          scrollEnabled={scrollEnabled}
          keyExtractor={keyExtractor}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={renderItemSeparatorComponent}
          renderItem={renderItem}
        />
      );
    case NftViewerItemPreviewVariant.large:
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
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  columnWrapperStyle: {
    justifyContent: 'space-between',
  },
});
