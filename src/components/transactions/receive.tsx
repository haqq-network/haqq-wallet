import React from 'react';

import {StyleSheet, TouchableWithoutFeedback, View} from 'react-native';

import {TransactionListReceive} from '../../types';
import {shortAddress} from '../../utils';
import {
  LIGHT_BG_3,
  LIGHT_GRAPHIC_BASE_1,
  LIGHT_TEXT_BASE_1,
  LIGHT_TEXT_BASE_2,
  LIGHT_TEXT_GREEN_1,
} from '../../variables';
import {ArrowReceive, Text} from '../ui';

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
          <ArrowReceive color={LIGHT_GRAPHIC_BASE_1} />
        </View>
        <View style={page.infoContainer}>
          <View style={page.infoRow}>
            <Text t11 style={page.info}>
              Received
            </Text>
            <Text t11 style={page.sum}>
              {`+${item.value.toFixed(2)} ISLM`}
            </Text>
          </View>
          <View style={page.infoRow}>
            <Text t14 style={page.detail}>
              {`from ${shortAddress(item.from, '•')}`}
            </Text>
            <Text t14 style={page.detail}>
              {`+ ${item.value.toFixed(2)} $`}
            </Text>
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
  infoContainer: {marginLeft: 12, flex: 1},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  sum: {
    color: LIGHT_TEXT_GREEN_1,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    backgroundColor: LIGHT_BG_3,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detail: {color: LIGHT_TEXT_BASE_2},
  info: {color: LIGHT_TEXT_BASE_1},
});
