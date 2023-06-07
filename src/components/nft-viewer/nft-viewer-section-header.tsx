import React, {useCallback} from 'react';

import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {NftCollection} from '@app/types';

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

  return (
    <MenuNavigationButton onPress={handlePress} style={styles.headerContainer}>
      <Image
        resizeMode="cover"
        style={styles.headerImage}
        source={{uri: item.image}}
      />
      <Spacer width={12} />
      <View>
        <Text t11 color={Color.textBase1}>
          {item.name}
        </Text>
        <Text t14 color={Color.textBase2}>
          {item.items.length} items
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
