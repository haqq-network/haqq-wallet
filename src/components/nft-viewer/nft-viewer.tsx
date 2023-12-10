import React, {useCallback, useMemo, useState} from 'react';

import {useActionSheet} from '@expo/react-native-action-sheet';
import {Image, StyleProp, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {NftViewerCollectionPreviewGrid} from '@app/components/nft-viewer/nft-viewer-collection-preview/nft-viewer-collection-preview-grid';
import {NftViewerCollectionPreviewList} from '@app/components/nft-viewer/nft-viewer-collection-preview/nft-viewer-collection-preview-list';
import {NftSection} from '@app/components/nft-viewer/types';
import {createTheme} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {useLayoutAnimation} from '@app/hooks/use-layout-animation';
import {I18N, getText} from '@app/i18n';
import {Nft} from '@app/models/nft';
import {HaqqCosmosAddress, NftCollection, NftItem} from '@app/types';
import {SortDirectionEnum, arraySortUtil} from '@app/utils';

import {First, Icon, IconButton, IconsName, Spacer, Text} from '../ui';

export interface NftViewerProps {
  scrollEnabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export enum NftViewerViewMode {
  collectionGrid,
  collectionListWithItems,
}

const NftSortingNamesMap = {
  created_at: getText(I18N.sortByAdding),
  name: getText(I18N.sortByName),
} as Record<keyof NftCollection, string>;

const ViewModeChangeStateMap = {
  [NftViewerViewMode.collectionGrid]: NftViewerViewMode.collectionListWithItems,
  [NftViewerViewMode.collectionListWithItems]: NftViewerViewMode.collectionGrid,
};

const ViewModeIconsMap = {
  [NftViewerViewMode.collectionGrid]: IconsName.squares,
  [NftViewerViewMode.collectionListWithItems]: IconsName.list_squares,
};

export const NftViewer = ({style, scrollEnabled = true}: NftViewerProps) => {
  const navigation = useTypedNavigation();
  const {showActionSheetWithOptions} = useActionSheet();
  const {animate} = useLayoutAnimation();
  const data = Nft.getAllCollections();

  const [viewMode, setViewMode] = useState(NftViewerViewMode.collectionGrid);
  const viewModeIconName = useMemo(() => {
    const nextViewMode = ViewModeChangeStateMap[viewMode];
    return ViewModeIconsMap[nextViewMode];
  }, [viewMode]);

  const [sortDirection, setSortDirection] = useState(
    SortDirectionEnum.descending,
  );
  const [sortFieldName, setSortFieldName] =
    useState<keyof NftCollection>('created_at');

  const sections: NftSection[] = useMemo(
    () =>
      data
        .map(item => ({...item, data: [{data: item.data}]}) as NftSection)
        .sort(arraySortUtil(sortDirection, sortFieldName)),
    [data, sortDirection, sortFieldName],
  );

  const onPressSort = useCallback(() => {
    showActionSheetWithOptions(
      {
        options: [
          NftSortingNamesMap.created_at,
          NftSortingNamesMap.name,
          getText(I18N.cancel),
        ],
        cancelButtonIndex: 2,
        message: 'NFT Sorting',
      },
      selectedIndex => {
        switch (selectedIndex) {
          // by adding
          case 0:
            animate();
            setSortDirection(SortDirectionEnum.descending);
            setSortFieldName('created_at');
            break;
          // by name
          case 1:
            animate();
            setSortDirection(SortDirectionEnum.ascending);
            setSortFieldName('name');
            break;
        }
      },
    );
  }, [animate, showActionSheetWithOptions]);

  const onChangeViewModePress = useCallback(() => {
    const nextViewMode = ViewModeChangeStateMap[viewMode];
    animate();
    setViewMode(nextViewMode);
  }, [animate, viewMode]);

  const onNftCollectionPress = useCallback(
    (collectionId: HaqqCosmosAddress) => {
      navigation.navigate('nftDetails', {type: 'collection', collectionId});
    },
    [navigation],
  );

  const onNftItemPress = useCallback(
    (item: NftItem) => {
      navigation.navigate('nftDetails', {type: 'nft', item});
    },
    [navigation],
  );

  if (!data?.length) {
    return (
      <View style={styles.empty}>
        <Image
          style={styles.emptyImage}
          source={require('@assets/images/none-nft.png')}
        />
        <Spacer height={12} />
        <Text t13 color={Color.textSecond1} i18n={I18N.nftViewerNoNFTs} />
      </View>
    );
  }

  return (
    <View style={style}>
      <View style={styles.row}>
        <Text t13 onPress={onPressSort}>
          {NftSortingNamesMap[sortFieldName]}
        </Text>
        <IconButton onPress={onChangeViewModePress}>
          <Icon color={Color.graphicBase1} name={viewModeIconName} />
        </IconButton>
      </View>
      <Spacer height={19} />
      <First>
        {viewMode === NftViewerViewMode.collectionListWithItems && (
          <NftViewerCollectionPreviewList
            data={sections}
            onItemPress={onNftItemPress}
            onCollectionPress={onNftCollectionPress}
            scrollEnabled={scrollEnabled}
          />
        )}
        {viewMode === NftViewerViewMode.collectionGrid && (
          <NftViewerCollectionPreviewGrid
            data={data}
            onPress={onNftCollectionPress}
            scrollEnabled={false}
          />
        )}
      </First>
    </View>
  );
};

const styles = createTheme({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyImage: {
    height: 80,
    width: 80,
    tintColor: Color.graphicSecond3,
  },
});
