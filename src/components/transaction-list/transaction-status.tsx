import React, {useMemo} from 'react';

import {ImageStyle, StyleProp, View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconsName, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {IndexerTransactionStatus} from '@app/types';

type TransactionStatusProps = {
  status?: IndexerTransactionStatus;
  style?: StyleProp<ImageStyle>;
  hasTitle?: boolean;
};

export const TransactionStatus = ({
  status,
  style,
  hasTitle,
}: TransactionStatusProps) => {
  const transactionData = useMemo((): {
    icon: IconsName;
    color: string;
    title: I18N;
  } => {
    switch (status) {
      case IndexerTransactionStatus.failed:
        return {
          icon: IconsName.close,
          color: Color.textRed1,
          title: I18N.transactionStatusFailed,
        };
      case IndexerTransactionStatus.success:
        return {
          icon: IconsName.check,
          color: Color.textGreen1,
          title: I18N.transactionStatusSuccess,
        };
      default:
        return {
          icon: IconsName.inprogress,
          color: Color.textBlue1,
          title: I18N.transactionStatusInProgress,
        };
    }
  }, [status]);

  if (status === undefined) {
    return null;
  }

  return (
    <View style={[styles.wrapper, style, hasTitle && styles.removeLeftPadding]}>
      <Icon
        i16
        name={transactionData.icon}
        color={transactionData.color}
        style={styles.icon}
      />
      {hasTitle && (
        <Text t11 color={Color.textBase1} i18n={transactionData.title} />
      )}
    </View>
  );
};

const styles = createTheme({
  removeLeftPadding: {paddingLeft: 0, marginTop: 0},
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
  },
  icon: {marginRight: 4},
});
