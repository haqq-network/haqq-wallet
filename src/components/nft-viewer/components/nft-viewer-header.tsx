import React, {useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  NftSortingNamesMap,
  NftViewerViewMode,
  ViewModeChangeStateMap,
  ViewModeIconsMap,
} from '@app/components/nft-viewer/types';
import {Icon, IconButton, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {NftCollection} from '@app/types';

type Props = {
  onPressSort: () => void;
  onChangeViewModePress: () => void;
  sortFieldName: keyof NftCollection;
  viewMode: NftViewerViewMode;
};

export const NftViewerHeader = ({
  onPressSort,
  onChangeViewModePress,
  sortFieldName,
  viewMode,
}: Props) => {
  const viewModeIconName = useMemo(() => {
    const nextViewMode = ViewModeChangeStateMap[viewMode];
    return ViewModeIconsMap[nextViewMode];
  }, [viewMode]);

  return (
    <View style={styles.row}>
      <Text t13 onPress={onPressSort}>
        {NftSortingNamesMap[sortFieldName]}
      </Text>
      <IconButton onPress={onChangeViewModePress}>
        <Icon color={Color.graphicBase1} name={viewModeIconName} />
      </IconButton>
    </View>
  );
};

const styles = createTheme({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
