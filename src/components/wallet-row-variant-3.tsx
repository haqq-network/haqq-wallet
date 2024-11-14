import React, {useCallback, useMemo} from 'react';

import {StyleSheet, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

import {Color} from '@app/colors';
import {CardSmall, Text, TextVariant} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {Provider} from '@app/models/provider';

import {WalletRowProps} from './wallet-row';

const CARD_WIDTH = 52;
const CARD_RADIUS = 6;

export const WalletRowVariant3 = ({
  item,
  onPress,
  style,
  chainId,
}: Omit<WalletRowProps, 'type'>) => {
  const provider = useMemo(() => Provider.getByEthChainId(chainId!), [chainId]);
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

  const addressString = useMemo(() => {
    if (provider?.isTron) {
      return item.tronAddress.slice(-4);
    }
    return item.address.slice(-4);
  }, [item, provider]);

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
        <Text variant={TextVariant.t18} color={Color.textBase3}>
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
  },
});
