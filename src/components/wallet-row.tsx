import React, {useMemo} from 'react';

import {StyleProp, StyleSheet, ViewStyle} from 'react-native';

import {CardSmall, DataContent, MenuNavigationButton} from '@app/components/ui';
import {Wallet} from '@app/models/wallet';
import {shortAddress} from '@app/utils';

export type WalletRowProps = {
  item: Wallet;
  style?: StyleProp<ViewStyle>;
  onPress: (address: string) => void;
};
const CARD_WIDTH = 78;
const CARD_RADIUS = 8;

export const WalletRow = ({item, onPress}: WalletRowProps) => {
  const style = useMemo(
    () => (item.isHidden ? {opacity: 0.5} : {}),
    [item.isHidden],
  );

  const pressCard = () => onPress(item.address);
  return (
    <MenuNavigationButton onPress={pressCard} style={style}>
      <CardSmall
        width={CARD_WIDTH}
        borderRadius={CARD_RADIUS}
        pattern={item.pattern}
        colorFrom={item.colorFrom}
        colorTo={item.colorTo}
        colorPattern={item.colorPattern}
      />
      <DataContent
        style={styles.info}
        title={item.name}
        subtitle={shortAddress(item.address)}
      />
    </MenuNavigationButton>
  );
};

const styles = StyleSheet.create({
  info: {
    marginLeft: 12,
    flex: 1,
  },
});
