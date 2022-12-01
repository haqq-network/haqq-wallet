import React from 'react';

import {TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {createTheme} from '@app/helpers';
import {TransactionListSend} from '@app/types';
import {shortAddress} from '@app/utils';

import {DataContent, Icon, Text} from '../ui';

export type TransactionPreviewProps = {
  item: TransactionListSend;
  onPress: (hash: string) => void;
};

export const TransactionSend = ({item, onPress}: TransactionPreviewProps) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        onPress(item.hash);
      }}>
      <View style={page.container}>
        <View style={page.iconWrapper}>
          <Icon name="arrow_send" color={Color.graphicBase1} />
        </View>
        <DataContent
          style={page.infoContainer}
          title="Sent"
          subtitle={`to ${shortAddress(item.to, '•')}`}
        />
        <Text t11 color={Color.textRed1}>
          {`- ${item.value.toFixed(2)} ISLM`}
        </Text>
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
  infoContainer: {
    marginLeft: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    backgroundColor: Color.bg3,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
