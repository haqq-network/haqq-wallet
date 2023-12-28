import React, {useCallback, useState} from 'react';

import {useActionSheet} from '@expo/react-native-action-sheet';
import {View} from 'react-native';

import {NftViewerHeader} from '@app/components/nft-viewer/components/nft-viewer-header';
import {NoNft} from '@app/components/nft-viewer/components/no-nft';
import {NftViewerCollectionPreviewGrid} from '@app/components/nft-viewer/nft-viewer-collection-preview/nft-viewer-collection-preview-grid';
import {NftViewerCollectionPreviewList} from '@app/components/nft-viewer/nft-viewer-collection-preview/nft-viewer-collection-preview-list';
import {
  NftSortingNamesMap,
  NftViewerProps,
  NftViewerViewMode,
  ViewModeChangeStateMap,
} from '@app/components/nft-viewer/types';
import {First, Spacer} from '@app/components/ui';
import {useTypedNavigation} from '@app/hooks';
import {useLayoutAnimation} from '@app/hooks/use-layout-animation';
import {I18N, getText} from '@app/i18n';
import {Nft} from '@app/models/nft';
import {HomeFeedStackRoutes} from '@app/screens/HomeStack/HomeFeedStack';
import {HaqqCosmosAddress, NftCollection, NftItem} from '@app/types';
import {SortDirectionEnum, arraySortUtil} from '@app/utils';

export const NftViewer = ({style}: NftViewerProps) => {
  const navigation = useTypedNavigation();
  const {showActionSheetWithOptions} = useActionSheet();
  const {animate} = useLayoutAnimation();

  const [viewMode, setViewMode] = useState(NftViewerViewMode.collectionGrid);

  const [sortDirection, setSortDirection] = useState(
    SortDirectionEnum.descending,
  );
  const [sortFieldName, setSortFieldName] =
    useState<keyof NftCollection>('created_at');

  const data = Nft.getAllCollections().sort(
    arraySortUtil(sortDirection, sortFieldName),
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
      navigation.navigate(HomeFeedStackRoutes.NftDetails, {
        type: 'collection',
        collectionId,
      });
    },
    [navigation],
  );

  const onNftItemPress = useCallback(
    (item: NftItem) => {
      navigation.navigate(HomeFeedStackRoutes.NftDetails, {type: 'nft', item});
    },
    [navigation],
  );

  if (!data?.length) {
    return <NoNft />;
  }

  return (
    <View style={style}>
      <NftViewerHeader
        onChangeViewModePress={onChangeViewModePress}
        onPressSort={onPressSort}
        sortFieldName={sortFieldName}
        viewMode={viewMode}
      />
      <Spacer height={19} />
      <First>
        {viewMode === NftViewerViewMode.collectionListWithItems && (
          <NftViewerCollectionPreviewList
            data={data}
            onItemPress={onNftItemPress}
            onCollectionPress={onNftCollectionPress}
          />
        )}
        {viewMode === NftViewerViewMode.collectionGrid && (
          <NftViewerCollectionPreviewGrid
            data={data}
            onPress={onNftCollectionPress}
          />
        )}
      </First>
    </View>
  );
};
