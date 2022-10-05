import React from 'react';
import {StyleSheet, TouchableWithoutFeedback, View} from 'react-native';
import {ArrowReceive, Paragraph} from '../ui';
import {TransactionListReceive} from '../../types';
import {
  BG_3,
  GRAPHIC_BASE_1,
  TEXT_BASE_1,
  TEXT_BASE_2,
  TEXT_GREEN_1,
} from '../../variables';

export type TransactionPreviewProps = {
  item: TransactionListReceive;
  onPress: (hash: string) => void;
};

export const TransactionReceive = ({
  item,
  onPress,
}: TransactionPreviewProps) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        onPress(item.hash);
      }}>
      <View style={page.container}>
        <View style={page.iconWrapper}>
          <ArrowReceive color={GRAPHIC_BASE_1} />
        </View>
        <View style={page.infoContainer}>
          <View style={page.infoRow}>
            <Paragraph clean style={{color: TEXT_BASE_1}}>
              Receive
            </Paragraph>
            <Paragraph clean style={page.sum}>
              {`+${item.value.toFixed(2)} ISLM`}
            </Paragraph>
          </View>
          <View style={page.infoRow}>
            <Paragraph clean style={{color: TEXT_BASE_2}}>
              {`from ${item.from.slice(0, 5)}•••${item.from.slice(
                item.from.length - 5,
                item.from.length,
              )}`}
            </Paragraph>
            <Paragraph clean style={{color: TEXT_BASE_2}}>
              {`+${item.value.toFixed(2)} $`}
            </Paragraph>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const page = StyleSheet.create({
  container: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  infoContainer: {marginLeft: 16, flex: 1},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  sum: {
    color: TEXT_GREEN_1,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    backgroundColor: BG_3,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
