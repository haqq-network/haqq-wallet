import React, {useCallback} from 'react';

import {Image, TouchableOpacity} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useNftImage} from '@app/hooks/use-nft-image';

import {NftViewerItemPreviewExtendedProps} from './nft-viewer-item-preview';

export const NftViewerItemPreviewSmall = ({
  item,
  onPress,
}: NftViewerItemPreviewExtendedProps) => {
  const handlePress = useCallback(() => onPress?.(item), [onPress, item]);
  const imageUri = useNftImage(item.cached_url);

  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={handlePress}
      style={styles.container}>
      <Image style={styles.image} source={imageUri} resizeMode="contain" />
    </TouchableOpacity>
  );
};

const SIZE = 60;

const styles = createTheme({
  image: {
    borderRadius: 12,
    width: SIZE,
    height: SIZE,
    transform: [{scale: 0.55}],
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
