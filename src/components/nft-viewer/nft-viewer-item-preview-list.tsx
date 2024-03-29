import React, {useCallback} from 'react';

import {ListRenderItem, StyleSheet} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

import {NftItem} from '@app/models/nft';
import {NftWidgetSize} from '@app/types';

import {NftViewerItemPreview} from './nft-viewer-item-preview';

import {Spacer} from '../ui';

export interface NftViewerItemPreviewListProps {
  data: NftItem[];
  variant: NftWidgetSize;

  onPress?(item: NftItem): void;
}

export const NftViewerItemPreviewList = ({
  data,
  variant,
  onPress,
}: NftViewerItemPreviewListProps) => {
  const keyExtractor = useCallback(
    (item: NftItem) => `${item.contract}_${item.tokenId}`,
    [],
  );

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
    case NftWidgetSize.large:
      return (
        <FlatList
          data={data}
          numColumns={2}
          keyExtractor={keyExtractor}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={renderItemSeparatorComponent}
          renderItem={renderItem}
          columnWrapperStyle={styles.columnWrapperStyle}
        />
      );
    case NftWidgetSize.small:
    case NftWidgetSize.medium:
    default:
      return (
        <FlatList
          data={data}
          horizontal
          keyExtractor={keyExtractor}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={renderItemSeparatorComponent}
          renderItem={renderItem}
        />
      );
  }
};

const styles = StyleSheet.create({
  columnWrapperStyle: {
    justifyContent: 'space-between',
  },
});
