import React, {useCallback} from 'react';

import {Image, TouchableOpacity} from 'react-native';

import {Color, createTheme} from '@app/theme';

import {NftViewerItemPreviewExtendedProps} from './nft-viewer-item-preview';

export const NftViewerItemPreviewSmall = ({
  item,
  onPress,
}: NftViewerItemPreviewExtendedProps) => {
  const handlePress = useCallback(() => onPress?.(item), [onPress, item]);

  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={handlePress}
      style={styles.container}>
      <Image style={styles.image} source={{uri: item.image}} />
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
