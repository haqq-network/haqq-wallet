import React, {useCallback, useMemo} from 'react';

import {TouchableWithoutFeedback, View} from 'react-native';

import {Color} from '@app/colors';
import {DataContent, Icon, Text} from '@app/components/ui';
import {cleanNumber, createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Wallet} from '@app/models/wallet';
import {OnTransactionRowPress, TransactionListContract} from '@app/types';

export type TransactionPreviewProps = {
  item: TransactionListContract;
  onPress: OnTransactionRowPress;
  contractName: string;
};

export const TransactionContract = ({
  item,
  onPress,
  contractName,
}: TransactionPreviewProps) => {
  const adressList = Wallet.addressList();

  const isSend = useMemo(() => {
    return adressList.includes(item.from);
  }, [adressList, item.from]);

  const handlePress = useCallback(() => {
    onPress(item.hash, {contractName});
  }, [item.hash, onPress, contractName]);

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Icon name="contract" color={Color.graphicBase1} />
        </View>
        <DataContent
          style={styles.infoContainer}
          titleI18n={I18N.transactionContractTitle}
          subtitleI18n={I18N.transactionContractNamePrefix}
          subtitleI18nParams={{
            value: contractName,
          }}
          short
        />
        {!!item.value && (
          <Text
            t11
            color={isSend ? Color.textRed1 : Color.textGreen1}
            i18n={
              isSend
                ? I18N.transactionNegativeAmountText
                : I18N.transactionPositiveAmountText
            }
            i18params={{value: cleanNumber(item.value)}}
          />
        )}
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
