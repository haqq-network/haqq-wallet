import React, {useCallback} from 'react';

import {Image, TouchableOpacity} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';

import {NftViewerItemPreviewExtendedProps} from './nft-viewer-item-preview';

export const NftViewerItemPreviewSmall = ({
  item,
  onPress,
}: NftViewerItemPreviewExtendedProps) => {
  const handlePress = useCallback(() => onPress?.(item), [onPress, item]);

  // TODO Remove image check when default image will be added
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={handlePress}
      style={styles.container}>
      <Image
        style={styles.image}
        source={{uri: item.cached_url || undefined}}
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
    width: SIZE,
    height: SIZE,
    backgroundColor: Color.bg9,
  },
});
