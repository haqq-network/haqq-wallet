import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {MenuNavigationButton, Paragraph} from './ui';
import {Wallet} from '../models/wallet';
import {TEXT_BASE_1, TEXT_BASE_2} from '../variables';
import {shortAddress} from '../utils';

export type WalletRowProps = {
  item: Wallet;
  onPress: (address: string) => void;
};

export const WalletRow = ({item, onPress}: WalletRowProps) => {
  return (
    <MenuNavigationButton onPress={() => onPress(item.address)}>
      <View />
      <View>
        <Paragraph style={page.title}>{item.name}</Paragraph>
        <Text style={page.address}>{shortAddress(item.address)}</Text>
      </View>
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
  title: {
    color: TEXT_BASE_1,
  },
  address: {
    fontSize: 14,
    lineHeight: 18,
    color: TEXT_BASE_2,
  },
});
