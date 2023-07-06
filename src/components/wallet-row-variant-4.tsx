import React, {useCallback, useMemo} from 'react';

import {StyleSheet, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

import {Color} from '@app/colors';
import {CardSmall, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {splitAddress} from '@app/utils';

import {WalletRowProps} from './wallet-row';

const CARD_WIDTH = 78;
const MARGIN_HORIZONTAL = 8;
const CARD_RADIUS = 8;
export const WALLET_ROW_4_WIDTH = CARD_WIDTH + MARGIN_HORIZONTAL;

export const WalletRowVariant4 = ({
  item,
  onPress,
  style,
}: Omit<WalletRowProps, 'type'>) => {
  const containerStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.container,
        item.isHidden && {opacity: 0.5},
        style,
      ]),
    [item.isHidden, style],
  );
  const pressCard = useCallback(
    () => onPress?.(item.address),
    [item.address, onPress],
  );

  const addressString = useMemo(
    () => `•••${splitAddress(item.address)[2]}`,
    [item.address],
  );

  return (
    <TouchableOpacity style={containerStyle} onPress={pressCard}>
      <CardSmall
        width={CARD_WIDTH}
        borderRadius={CARD_RADIUS}
        pattern={item.pattern}
        colorFrom={item.colorFrom}
        colorTo={item.colorTo}
        colorPattern={item.colorPattern}
      />
      <View style={styles.textContainer}>
        <Text t14 color={Color.textBase3} numberOfLines={1}>
          {item.name}
        </Text>
        <Text t18 color={Color.textBase3}>
          {addressString}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = createTheme({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignSelf: 'center',
    marginHorizontal: MARGIN_HORIZONTAL,
  },
});
