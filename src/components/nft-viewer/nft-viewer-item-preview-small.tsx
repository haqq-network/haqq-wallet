import React, {useCallback, useMemo} from 'react';

import {TouchableOpacity, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useNftImage} from '@app/hooks/nft/use-nft-image';
import {useLayout} from '@app/hooks/use-layout';

import {NftViewerItemPreviewExtendedProps} from './nft-viewer-item-preview';

import {ImageWrapper} from '../image-wrapper';

export const NftViewerItemPreviewSmall = ({
  item,
  onPress,
}: NftViewerItemPreviewExtendedProps) => {
  const handlePress = useCallback(() => onPress?.(item), [onPress, item]);
  const imageUri = useNftImage(item.cached_url);
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
      <ImageWrapper
        style={styles.image}
        source={imageUri}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const SIZE = 60;

const styles = createTheme({
  image: {
    borderRadius: 12,
    width: SIZE,
    height: SIZE,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 12,
    width: SIZE,
    height: SIZE,
    backgroundColor: Color.bg9,
  },
});
