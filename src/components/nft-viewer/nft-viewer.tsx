import React, {useCallback, useMemo, useState} from 'react';

import {useActionSheet} from '@expo/react-native-action-sheet';
import {
  Image,
  SectionList,
  SectionListData,
  SectionListRenderItem,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useTypedNavigation} from '@app/hooks';
import {useLayoutAnimation} from '@app/hooks/use-layout-animation';
import {I18N, getText} from '@app/i18n';
import {Nft, NftCollection, NftItem} from '@app/models/nft';
import {Wallet} from '@app/models/wallet';
import {HomeStackRoutes, NftStackRoutes} from '@app/route-types';
import {NftWidgetSize} from '@app/types';
import {SortDirectionEnum, arraySortUtil} from '@app/utils';

import {NftViewerCollectionPreviewList} from './nft-viewer-collection-preview-list';
import {NftViewerItemPreviewList} from './nft-viewer-item-preview-list';
import {NftViewerSectionHeader} from './nft-viewer-section-header';

import {
  First,
  Icon,
  IconButton,
  IconsName,
  Spacer,
  Text,
  TextVariant,
} from '../ui';

export interface NftViewerProps {
  scrollEnabled?: boolean;
  wallet?: Wallet;
  style?: StyleProp<ViewStyle>;
}

export enum NftViewerViewMode {
  collectionGrid,
  collectionListWithItems,
}

type SectionElement = {data: [NftCollection]} & NftCollection;
type RenderSectionProps = {
  section: SectionListData<NftCollection, SectionElement>;
};

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

export const NftViewer = ({
  style,
  wallet,
  scrollEnabled = true,
}: NftViewerProps) => {
  const navigation = useTypedNavigation();
  const {showActionSheetWithOptions} = useActionSheet();
  const {animate} = useLayoutAnimation();

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

  const sections = useMemo(() => {
    const data = wallet
      ? Nft.getCollectionsByWallet(wallet.cosmosAddress)
      : Nft.getAllCollections();

    return data
      ?.map?.(it => ({...it, data: [it]}) as SectionElement)
      ?.sort?.(arraySortUtil(sortDirection, sortFieldName));
  }, [sortDirection, sortFieldName]);

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
    (item: NftCollection) => {
      navigation.navigate(HomeStackRoutes.Nft, {
        initScreen: NftStackRoutes.NftCollectionDetails,
        item,
      });
    },
    [navigation],
  );

  const onNftItemPress = useCallback(
    (item: NftItem) => {
      navigation.navigate(HomeStackRoutes.Nft, {
        initScreen: NftStackRoutes.NftItemDetails,
        item,
      });
    },
    [navigation],
  );

  const keyExtractor = useCallback((item: NftCollection) => item.address, []);

  const renderItem: SectionListRenderItem<NftCollection, SectionElement> =
    useCallback(
      ({item: section}) => (
        <NftViewerItemPreviewList
          variant={NftWidgetSize.medium}
          onPress={onNftItemPress}
          data={section.nfts}
        />
      ),
      [onNftItemPress],
    );

  const renderSectionHeader = useCallback(
    ({section}: RenderSectionProps) => {
      return (
        <NftViewerSectionHeader item={section} onPress={onNftCollectionPress} />
      );
    },
    [onNftCollectionPress],
  );

  const renderSectionSeparatorComponent = useCallback(
    () => <Spacer height={28} />,
    [],
  );

  if (!sections?.length) {
    return (
      <View style={styles.empty}>
        <Image
          style={styles.emptyImage}
          source={require('@assets/images/none-nft.png')}
        />
        <Spacer height={12} />
        <Text
          variant={TextVariant.t13}
          color={Color.textSecond1}
          i18n={I18N.nftViewerNoNFTs}
        />
      </View>
    );
  }

  return (
    <View style={style}>
      <View style={styles.row}>
        <Text variant={TextVariant.t13} onPress={onPressSort}>
          {NftSortingNamesMap[sortFieldName]}
        </Text>
        <IconButton onPress={onChangeViewModePress}>
          <Icon color={Color.graphicBase1} name={viewModeIconName} />
        </IconButton>
      </View>
      <Spacer height={19} />
      <First>
        {viewMode === NftViewerViewMode.collectionListWithItems && (
          <SectionList
            scrollEnabled={scrollEnabled}
            sections={sections}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            SectionSeparatorComponent={renderSectionSeparatorComponent}
          />
        )}
        {viewMode === NftViewerViewMode.collectionGrid && (
          <NftViewerCollectionPreviewList
            data={sections}
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
