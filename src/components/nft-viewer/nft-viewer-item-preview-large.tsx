import React, {useCallback, useMemo} from 'react';

import {ImageBackground, TouchableOpacity, View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useNftImage} from '@app/hooks/nft';
import {useLayout} from '@app/hooks/use-layout';
import {addOpacityToColor} from '@app/utils';

import {NftViewerItemPreviewExtendedProps} from './nft-viewer-item-preview';

import {Text, TextVariant} from '../ui';

export const NftViewerItemPreviewLarge = ({
  item,
  onPress,
}: NftViewerItemPreviewExtendedProps) => {
  const imageUri = useNftImage(item.metadata?.image || item?.cached_url);
  const handlePress = useCallback(() => onPress?.(item), [onPress, item]);
  const [layout, onLayout] = useLayout();
  const itemTextStyle = useMemo(
    () => ({
      width: layout.width - ITEM_TEXT_POSSITION_OFFSET * 2,
    }),
    [layout.width],
  );

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
        style={layout}
        resizeMode="contain"
        source={imageUri}>
        <View style={[styles.itemText, itemTextStyle]}>
          <Text
            numberOfLines={1}
            variant={TextVariant.t13}
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
