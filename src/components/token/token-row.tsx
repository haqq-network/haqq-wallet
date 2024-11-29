import React, {useMemo} from 'react';

import {TouchableOpacity, View} from 'react-native';

import {Color} from '@app/colors';
import {Spacer, Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {Provider} from '@app/models/provider';

import {TokenIcon} from './token-icon';
import {TokenRowProps} from './token.types';

export const TokenRow = ({item, checked = false, onPress}: TokenRowProps) => {
  const priceInUSD = useMemo(() => {
    return item?.value?.toFiat?.({fixed: 4, chainId: item.chain_id});
  }, [item]);

  const providerNetworkName = useMemo(() => {
    const p = Provider.getByEthChainId(item.chain_id);
    return p?.name;
  }, []);

  return (
    <TouchableOpacity
      testID={String(item?.symbol)?.toUpperCase()}
      disabled={!onPress || checked === true}
      onPress={onPress}
      style={[
        styles.container,
        checked && styles.checked,
        !item.is_in_white_list && styles.notWhiteListed,
      ]}>
      <TokenIcon item={item} />
      <Spacer width={20} />
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
            {item?.value?.toBalanceString?.('auto', undefined, true, true)}
          </Text>
        </View>
        <View style={styles.row}>
          <View style={styles.providerNetworkNameContainer}>
            <Text variant={TextVariant.t14} color={Color.textBase2}>
              {providerNetworkName}
            </Text>
          </View>
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
  notWhiteListed: {
    backgroundColor: Color.bg6,
    borderRadius: 12,
    padding: 4,
  },
  tokenName: {maxWidth: 220},
  container: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
  },
  checked: {
    opacity: 0.5,
  },
  providerNetworkNameContainer: {
    backgroundColor: Color.bg8,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
});
