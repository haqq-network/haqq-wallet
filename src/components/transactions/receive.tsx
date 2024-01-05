import React, {useCallback, useMemo} from 'react';

import {TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {TransactionStatus} from '@app/components/transaction-status/transaction-status';
import {DataContent, Icon, IconsName, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {shortAddress} from '@app/helpers/short-address';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';
import {TransactionListReceive} from '@app/types';

export type TransactionPreviewProps = {
  item: TransactionListReceive;
  onPress: (hash: string) => void;
};

export const TransactionReceive = ({
  item,
  onPress,
}: TransactionPreviewProps) => {
  const subtitle = useMemo(
    () => `from ${shortAddress(item.from, '•')}`,
    [item.from],
  );
  const handlePress = useCallback(() => {
    onPress(item.hash);
  }, [item.hash, onPress]);

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Icon name={IconsName.arrow_receive} color={Color.graphicBase1} />
        </View>
        <DataContent
          style={styles.infoContainer}
          title={
            <View style={styles.titleWrapper}>
              <Text
                i18n={I18N.transactionReceiveTitle}
                color={Color.textBase1}
              />
              <TransactionStatus status={item.status} />
            </View>
          }
          subtitle={subtitle}
          short
        />

        <View style={styles.amountWrapper}>
          <Text
            t11
            color={Color.textGreen1}
            i18n={I18N.transactionPositiveAmountText}
            i18params={{value: new Balance(item.value).toBalanceString()}}
          />
          <Spacer height={2} />
          <Text
            t14
            color={Color.textBase2}
            i18n={I18N.transactionNegativeAmountText}
            i18params={{
              value: new Balance(item.value).toFiat('USD').toBalanceString(),
            }}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = createTheme({
  amountWrapper: {flexDirection: 'column', alignItems: 'flex-end'},
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
