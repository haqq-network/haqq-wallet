import {StyleProp, ViewStyle} from 'react-native';

import {IconsName} from '@app/components/ui';
import {I18N, getText} from '@app/i18n';
import {NftCollection, NftItem} from '@app/types';

export interface NftSection extends Omit<NftCollection, 'data'> {
  data: NftSectionData[];
}

export interface NftSectionData {
  data: NftItem[];
}

export interface NftViewerProps {
  style?: StyleProp<ViewStyle>;
}

export enum NftViewerViewMode {
  collectionGrid,
  collectionListWithItems,
}

export const NftSortingNamesMap = {
  created_at: getText(I18N.sortByAdding),
  name: getText(I18N.sortByName),
} as Record<keyof NftCollection, string>;

export const ViewModeChangeStateMap = {
  [NftViewerViewMode.collectionGrid]: NftViewerViewMode.collectionListWithItems,
  [NftViewerViewMode.collectionListWithItems]: NftViewerViewMode.collectionGrid,
};

export const ViewModeIconsMap = {
  [NftViewerViewMode.collectionGrid]: IconsName.squares,
  [NftViewerViewMode.collectionListWithItems]: IconsName.list_squares,
};
