import React, {useMemo} from 'react';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {Card, DataContent, MenuNavigationButton} from './ui';
import {Wallet} from '../models/wallet';
import {shortAddress} from '../utils';

export type WalletRowProps = {
  item: Wallet;
  style?: StyleProp<ViewStyle>;
  onPress: (address: string) => void;
};

export const WalletRow = ({item, onPress}: WalletRowProps) => {
  const style = useMemo(
    () => (item.isHidden ? {opacity: 0.5} : {}),
    [item.isHidden],
  );

  return (
    <MenuNavigationButton onPress={() => onPress(item.address)} style={style}>
      <Card width={78} borderRadius={8} variant={item.cardStyle} />
      <DataContent
        style={page.info}
        title={item.name}
        subtitle={shortAddress(item.address)}
      />
    </MenuNavigationButton>
  );
};

const page = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    paddingVertical: 16,
  },
  info: {
    marginLeft: 12,
  },
});
