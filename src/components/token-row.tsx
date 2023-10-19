import React, {useMemo} from 'react';

import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {IToken} from '@app/types';

export interface TokenRowProps {
  item: IToken;
  usdPrice?: number;
}

export const TokenRow = ({item, usdPrice = 0}: TokenRowProps) => {
  const priceInUSD = useMemo(() => {
    const price = item.value.toEther() * usdPrice;
    if (price > 0) {
      return `$${price}`;
    }
    return '';
  }, [item, usdPrice]);
  return (
    <View style={styles.container}>
      <Image
        style={styles.icon}
        source={item.image || require('@assets/images/empty-icon.png')}
        resizeMode="cover"
      />
      <Spacer width={12} />
      <View style={styles.textContainer}>
        <View style={styles.row}>
          <Text t11>{item.name}</Text>
          <Spacer />
          <Text t11>{item.value.toEtherString()}</Text>
        </View>
        <View style={styles.row}>
          <Text t14 color={Color.textBase2}>
            {item.symbol}
          </Text>
          <Spacer />
          <Text t14 color={Color.textBase2}>
            {priceInUSD}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = createTheme({
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
