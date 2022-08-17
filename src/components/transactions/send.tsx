import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ArrowSend} from '../ui';
import {TransactionListSend} from '../../types';
import {
  BG_3,
  GRAPHIC_BASE_1,
  TEXT_BASE_1,
  TEXT_BASE_2,
  TEXT_RED_1,
} from '../../variables';

export type TransactionPreviewProps = {
  item: TransactionListSend;
};

export const TransactionSend = ({item}: TransactionPreviewProps) => {
  console.log(item);
  return (
    <View style={page.container}>
      <View style={page.iconWrapper}>
        <ArrowSend color={GRAPHIC_BASE_1} />
      </View>
      <View style={page.infoContainer}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{color: TEXT_BASE_1}}>Sent</Text>
          <Text style={page.sum}>{`-${item.value.toFixed(2)} ISLM`}</Text>
        </View>
        <Text style={{color: TEXT_BASE_2}}>
          {`to ${item.to.slice(0, 5)}•••${item.to.slice(
            item.to.length - 5,
            item.to.length,
          )}`}
        </Text>
      </View>
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContainer: {marginLeft: 16, flex: 1},
  sum: {color: TEXT_RED_1},
  iconWrapper: {
    width: 42,
    height: 42,
    backgroundColor: BG_3,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
