import React, {useCallback} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {useNftCollectionImage} from '@app/hooks/nft';
import {NftCollection} from '@app/models/nft';

import {ImageWrapper} from '../image-wrapper';
import {MenuNavigationButton, Spacer, Text} from '../ui';

export interface NftViewerSectionHeaderProps {
  item: NftCollection;

  onPress(item: NftCollection): void;
}

export const NftViewerSectionHeader = ({
  item,
  onPress,
}: NftViewerSectionHeaderProps) => {
  const handlePress = useCallback(() => onPress?.(item), [onPress, item]);
  const collectionImageUri = useNftCollectionImage(item.nfts);

  return (
    <MenuNavigationButton onPress={handlePress} style={styles.headerContainer}>
      <ImageWrapper
        resizeMode="cover"
        style={styles.headerImage}
        source={collectionImageUri}
      />
      <Spacer width={12} />
      <View>
        <Text t11 color={Color.textBase1}>
          {item.name}
        </Text>
        <Text t14 color={Color.textBase2}>
          {item.nfts.length} items
        </Text>
      </View>
    </MenuNavigationButton>
  );
};

const styles = createTheme({
  headerImage: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
