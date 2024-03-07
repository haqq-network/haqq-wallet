import React, {useCallback, useMemo} from 'react';

import {ImageBackground, TouchableOpacity, View} from 'react-native';

import {useLayout} from '@app/hooks/use-layout';
import {I18N} from '@app/i18n';
import {Color, createTheme} from '@app/theme';
import {NftCollection} from '@app/types';
import {addOpacityToColor} from '@app/utils';

import {Text} from '../ui';

export interface NftViewerCollectionPreviewProps {
  item: NftCollection;

  onPress(item: NftCollection): void;
}

export const NftViewerCollectionPreview = ({
  item,
  onPress,
}: NftViewerCollectionPreviewProps) => {
  const handlePress = useCallback(() => onPress?.(item), [onPress, item]);
  const [layout, onLayout] = useLayout();

  const itemTextStyle = useMemo(
    () => ({
      width: layout.width - ITEM_TEXT_POSSITION_OFFSET * 2,
    }),
    [layout.width],
  );

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      onLayout={onLayout}>
      <ImageBackground
        imageStyle={styles.imageContainer}
        style={layout}
        source={{uri: item.image}}>
        <View style={[styles.itemText, itemTextStyle]}>
          <Text numberOfLines={1} t13 color={Color.textBase3}>
            {item.name}
          </Text>
          <Text
            t17
            color={Color.textSecond2}
            i18n={I18N.nftCollectionPreviewItemsCount}
            i18params={{count: `${item?.items?.length}`}}
          />
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const ITEM_TEXT_POSSITION_OFFSET = 8;

const styles = createTheme({
  imageContainer: {
    borderRadius: 12,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    width: '48.5%',
    height: 160,
    backgroundColor: Color.bg9,
  },
  itemText: {
    backgroundColor: addOpacityToColor(Color.bg9, 0.6),
    borderRadius: 4,
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    bottom: ITEM_TEXT_POSSITION_OFFSET,
    alignSelf: 'flex-start',
    marginHorizontal: ITEM_TEXT_POSSITION_OFFSET,
  },
});
