import React, {useCallback} from 'react';

import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {NftSection} from '@app/components/nft-viewer/types';
import {createTheme} from '@app/helpers';
import {HaqqCosmosAddress} from '@app/types';

import {MenuNavigationButton, Spacer, Text} from '../ui';

export interface NftViewerSectionHeaderProps {
  item: NftSection;

  onPress(id: HaqqCosmosAddress): void;
}

export const NftViewerSectionHeader = ({
  item,
  onPress,
}: NftViewerSectionHeaderProps) => {
  const handlePress = useCallback(() => onPress?.(item.id), [onPress, item]);

  return (
    <MenuNavigationButton onPress={handlePress} style={styles.headerContainer}>
      <Image
        resizeMode="cover"
        style={styles.headerImage}
        source={{uri: item.icon || item.data[0]?.data[0]?.image}}
      />
      <Spacer width={12} />
      <View>
        <Text t11 color={Color.textBase1}>
          {item.name}
        </Text>
        <Text t14 color={Color.textBase2}>
          {item.data[0].data.length} items
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
