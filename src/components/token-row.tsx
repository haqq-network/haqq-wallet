import React, {useMemo} from 'react';

import {TouchableOpacity, View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {IToken} from '@app/types';

import {ImageWrapper} from './image-wrapper';

export interface TokenRowProps {
  item: IToken;
  checked?: boolean | undefined;
  onPress?: () => void;
}

export const TokenRow = ({item, checked = false, onPress}: TokenRowProps) => {
  const priceInUSD = useMemo(() => {
    return item?.value?.toFiat?.({fixed: 4});
  }, [item]);

  return (
    <TouchableOpacity
      testID={String(item?.symbol)?.toUpperCase()}
      disabled={!onPress || checked === true}
      onPress={onPress}
      style={[styles.container, checked && styles.checked]}>
      <ImageWrapper
        style={styles.icon}
        source={item?.image || require('@assets/images/empty-icon.png')}
        resizeMode="cover"
      />
      <Spacer width={12} />
      <View style={styles.textContainer}>
        <View style={styles.row}>
          <Text
            variant={TextVariant.t11}
            numberOfLines={1}
            style={styles.tokenName}>
            {item?.symbol}
          </Text>
          <Spacer />
          <Text variant={TextVariant.t11}>
            {item?.value?.toBalanceString?.('auto')}
          </Text>
        </View>
        <View style={styles.row}>
          <Text variant={TextVariant.t14} color={Color.textBase2}>
            {item?.name}
          </Text>
          <Spacer />
          <Text variant={TextVariant.t14} color={Color.textBase2}>
            {priceInUSD}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

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
  checked: {
    opacity: 0.5,
  },
});
