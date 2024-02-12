import React, {useMemo} from 'react';

import {toJS} from 'mobx';
import {observer} from 'mobx-react';
import {Image, TouchableOpacity, View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {IToken} from '@app/types';
import {LONG_NUM_PRECISION} from '@app/variables/common';

export interface TokenRowProps {
  item: IToken;
  onPress?: () => void;
}

export const TokenRow = observer(({item: _item, onPress}: TokenRowProps) => {
  const item = useMemo(() => toJS(_item), [_item]);
  const priceInUSD = useMemo(() => {
    return item.value.toFiat('USD').toBalanceString(LONG_NUM_PRECISION);
  }, [item]);
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      style={styles.container}>
      <Image
        style={styles.icon}
        source={item.image || require('@assets/images/empty-icon.png')}
        resizeMode="cover"
      />
      <Spacer width={12} />
      <View style={styles.textContainer}>
        <View style={styles.row}>
          <Text t11 numberOfLines={1} style={styles.tokenName}>
            {item.symbol}
          </Text>
          <Spacer />
          <Text t11>{item.value.toBalanceString(LONG_NUM_PRECISION)}</Text>
        </View>
        <View style={styles.row}>
          <Text t14 color={Color.textBase2}>
            {item.name}
          </Text>
          <Spacer />
          <Text t14 color={Color.textBase2}>
            {priceInUSD}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = createTheme({
  tokenName: {maxWidth: 220},
  container: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
  },
});
