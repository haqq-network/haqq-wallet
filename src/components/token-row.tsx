import React, {useCallback, useMemo} from 'react';

import {Image, TouchableOpacity, View} from 'react-native';

import {Color} from '@app/colors';
import {cleanNumber, createTheme} from '@app/helpers';
import {TokenItem} from '@app/types';

import {Spacer, Text} from './ui';

export interface TokenRowProps {
  item: TokenItem;
  islmPrice: number;

  onPress?(tiker: string): void;
}

export function TokenRow({item, islmPrice, onPress}: TokenRowProps) {
  const totalUsd = useMemo(() => item.priceUsd * item.count, [item]);
  const totalUsdFormatted = useMemo(() => cleanNumber(totalUsd), [totalUsd]);

  const islmCount = useMemo(
    () => cleanNumber(totalUsd / islmPrice),
    [islmPrice, totalUsd],
  );

  const handlerPress = useCallback(
    () => onPress?.(item?.ticker),
    [onPress, item],
  );
  return (
    <TouchableOpacity style={styles.container} onPress={handlerPress}>
      <View style={styles.row}>
        <Image style={styles.icon} source={{uri: item.icon}} />
        <Spacer width={12} />
        <View style={styles.textContainer}>
          <View style={styles.row}>
            <Text t11>{item.name}</Text>
            <Spacer />
            <Text t11>{islmCount} ISLM</Text>
          </View>
          <View style={styles.row}>
            <Text t14 color={Color.textBase2}>
              {item.ticker}
            </Text>
            <Spacer />
            <Text t14 color={Color.textBase2}>
              ${totalUsdFormatted}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = createTheme({
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Color.graphicBase2,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
  },
});
