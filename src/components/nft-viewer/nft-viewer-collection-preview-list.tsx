import React, {useCallback, useMemo} from 'react';

import {
  FlatListProps,
  ListRenderItem,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';

import {Nft, NftCollection} from '@app/models/nft';

import {NftViewerCollectionPreview} from './nft-viewer-collection-preview';

import {Spacer} from '../ui';

export type NftViewerCollectionPreviewListProps = {
  data?: NftCollection[];
  scrollEnabled?: boolean;
  style?: ViewStyle;

  onPress(item: NftCollection): void;
} & Pick<FlatListProps<any>, 'ListHeaderComponent'>;

export const NftViewerCollectionPreviewList = ({
  data,
  onPress,
  scrollEnabled = true,
  ListHeaderComponent,
  style,
}: NftViewerCollectionPreviewListProps) => {
  const renderData = useMemo(() => data ?? Nft.getAllCollections(), [data]);
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
      data={renderData}
      numColumns={2}
      style={style}
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
