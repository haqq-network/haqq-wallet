import React, {useMemo} from 'react';

import {ImageStyle, StyleProp, View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconsName, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {TransactionStatus as TS} from '@app/models/transaction';

type TransactionStatusProps = {
  status?: TS;
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
      case TS.failed:
        return {
          icon: IconsName.close,
          color: Color.textRed1,
          title: I18N.transactionStatusFailed,
        };
      case TS.success:
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

  if (!status) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <Icon
        i16
        name={transactionData.icon}
        color={transactionData.color}
        style={style}
      />
      {hasTitle && <Text i18n={transactionData.title} style={styles.title} />}
    </View>
  );
};

const styles = createTheme({
  wrapper: {flexDirection: 'row', alignItems: 'center'},
  title: {marginLeft: 6},
});
