import React, {useCallback, useMemo} from 'react';

import {ImageBackground, TouchableOpacity, View} from 'react-native';

import {Color} from '@app/colors';
import {cleanNumber, createTheme} from '@app/helpers';
import {NftItem} from '@app/types';
import {addOpacityToColor} from '@app/utils';
import {WEI} from '@app/variables/common';

import {Text} from '../ui';

export interface NftViewerItemPreviewProps {
  item: NftItem;
  onPress(item: NftItem): void;
}

export const NftViewerItemPreview = ({
  item,
  onPress,
}: NftViewerItemPreviewProps) => {
  const lastSalePrice = useMemo(
    () => cleanNumber(parseInt(item.last_sale_price, 16) / WEI),
    [item],
  );
  const handlePress = useCallback(() => onPress?.(item), [onPress, item]);

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <ImageBackground
        imageStyle={styles.imageContainer}
        style={styles.image}
        source={{uri: item.image}}>
        <View style={styles.itemText}>
          <Text numberOfLines={1} t8 color={Color.textBase3}>
            {item.name}
          </Text>
          <Text t17 color={Color.textSecond2}>
            {lastSalePrice} ISLM
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const IMAGE_WIDTH = 120;
const ITEM_TEXT_POSSITION_OFFSET = 8;

const styles = createTheme({
  imageContainer: {
    borderRadius: 12,
  },
  image: {
    width: IMAGE_WIDTH,
    height: 110,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    width: IMAGE_WIDTH,
    height: 110,
  },
  itemText: {
    backgroundColor: addOpacityToColor(Color.bg9, 0.6),
    borderRadius: 4,
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    bottom: ITEM_TEXT_POSSITION_OFFSET,
    left: ITEM_TEXT_POSSITION_OFFSET,
    maxWidth: IMAGE_WIDTH - ITEM_TEXT_POSSITION_OFFSET,
  },
});
