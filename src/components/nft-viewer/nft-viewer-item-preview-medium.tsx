import React, {useCallback, useMemo} from 'react';

import {ImageBackground, TouchableOpacity, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useNftImage} from '@app/hooks/nft/use-nft-image';
import {useLayout} from '@app/hooks/use-layout';
import {addOpacityToColor} from '@app/utils';

import {NftViewerItemPreviewExtendedProps} from './nft-viewer-item-preview';

import {Text, TextVariant} from '../ui';

export const NftViewerItemPreviewMedium = ({
  item,
  onPress,
}: NftViewerItemPreviewExtendedProps) => {
  const handlePress = useCallback(() => onPress?.(item), [onPress, item]);
  const imageUri = useNftImage(item.metadata?.image || item?.cached_url);
  const [layout, onLayout] = useLayout();

  const containerStyle: ViewStyle = useMemo(
    () => ({
      height: layout.width,
    }),
    [layout.width],
  );

  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={handlePress}
      style={[styles.container, containerStyle]}
      onLayout={onLayout}>
      <ImageBackground
        imageStyle={styles.imageContainer}
        style={styles.image}
        resizeMode="contain"
        source={imageUri}>
        <View style={styles.itemText}>
          <Text
            numberOfLines={1}
            variant={TextVariant.t8}
            color={Color.textBase3}>
            {item.name}
          </Text>
          {item.price && (
            <Text variant={TextVariant.t17} color={Color.textSecond2}>
              {item.price.toBalanceString()}
            </Text>
          )}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const IMAGE_WIDTH = 120;
const ITEM_TEXT_POSITION_OFFSET = 8;

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
    backgroundColor: Color.bg9,
  },
  itemText: {
    backgroundColor: addOpacityToColor(Color.bg9, 0.6),
    borderRadius: 4,
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    bottom: ITEM_TEXT_POSITION_OFFSET,
    left: ITEM_TEXT_POSITION_OFFSET,
    maxWidth: IMAGE_WIDTH - ITEM_TEXT_POSITION_OFFSET,
  },
});
