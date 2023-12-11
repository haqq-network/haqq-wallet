import React, {useCallback, useMemo} from 'react';

import {TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {TransactionStatus} from '@app/components/transaction-status/transaction-status';
import {DataContent, Icon, IconsName, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {cleanNumber} from '@app/helpers/clean-number';
import {shortAddress} from '@app/helpers/short-address';
import {I18N} from '@app/i18n';
import {TransactionListSend} from '@app/types';

export type TransactionPreviewProps = {
  item: TransactionListSend;
  onPress: (hash: string) => void;
};

export const TransactionSend = ({item, onPress}: TransactionPreviewProps) => {
  const address = useMemo(
    () => shortAddress(item.to || item.contractAddress || '', '•'),
    [item.contractAddress, item.to],
  );
  const handlePress = useCallback(() => {
    onPress(item.hash);
  }, [item.hash, onPress]);

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Icon name={IconsName.arrow_send} color={Color.graphicBase1} />
        </View>
        <DataContent
          style={styles.infoContainer}
          title={
            <View style={styles.titleWrapper}>
              <Text i18n={I18N.transactionSendTitle} color={Color.textBase1} />
              <TransactionStatus status={item.status} />
            </View>
          }
          subtitleI18nParams={{
            address,
          }}
          subtitleI18n={I18N.transactionSendTo}
          short
        />
        <Text
          t11
          color={Color.textRed1}
          i18n={I18N.transactionNegativeAmountText}
          i18params={{value: cleanNumber(item.value)}}
        />
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
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
