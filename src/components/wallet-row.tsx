import React, {useMemo} from 'react';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {Wallet} from '../models/wallet';
import {shortAddress} from '../utils';
import {CardSmall, DataContent, MenuNavigationButton} from './ui';

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
      <CardSmall
        width={78}
        borderRadius={8}
        pattern={item.pattern}
        colorFrom={item.colorFrom}
        colorTo={item.colorTo}
        colorPattern={item.colorPattern}
      />
      <DataContent
        style={page.info}
        title={item.name}
        subtitle={shortAddress(item.address)}
      />
    </MenuNavigationButton>
  );
};

const page = StyleSheet.create({
  info: {
    marginLeft: 12,
    flex: 1,
  },
});
