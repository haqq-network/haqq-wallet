import React, {useCallback} from 'react';

import {ListRenderItem} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

import {NftItem} from '@app/types';

import {NftViewerItemPreview} from './nft-viewer-item-preview';

import {Spacer} from '../ui';

export interface NftViewerItemPreviewListProps {
  data: NftItem[];
  onPress(item: NftItem): void;
}

export const NftViewerItemPreviewList = ({
  data,
  onPress,
}: NftViewerItemPreviewListProps) => {
  const keyExtractor = useCallback((item: NftItem) => item.address, []);

  const renderItemSeparatorComponent = useCallback(
    () => <Spacer width={12} height={12} />,
    [],
  );

  const renderItem: ListRenderItem<NftItem> = useCallback(
    ({item}) => <NftViewerItemPreview item={item} onPress={onPress} />,
    [onPress],
  );

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
};
