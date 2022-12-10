import React from 'react';

import {TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {DataContent, Icon, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {TransactionListSend} from '@app/types';
import {shortAddress} from '@app/utils';

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
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Icon name="arrow_send" color={Color.graphicBase1} />
        </View>
        <DataContent
          style={styles.infoContainer}
          titleI18n={I18N.transactionSendTitle}
          subtitleI18nParams={{address: shortAddress(item.to, '•')}}
          subtitleI18n={I18N.transactionSendTo}
        />
        <Text t11 color={Color.textRed1}>
          {`- ${item.value.toFixed(2)} ISLM`}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = createTheme({
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
