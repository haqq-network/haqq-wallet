import React from 'react';

import {TouchableWithoutFeedback, View} from 'react-native';

import {Color, getColor} from '../../colors';
import {createTheme} from '../../helpers/create-theme';
import {TransactionListReceive} from '../../types';
import {shortAddress} from '../../utils';
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
          <ArrowReceive color={getColor(Color.graphicBase1)} />
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

const page = createTheme({
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
    color: Color.textGreen1,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    backgroundColor: Color.bg3,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detail: {color: Color.textBase2},
  info: {color: Color.textBase1},
});
