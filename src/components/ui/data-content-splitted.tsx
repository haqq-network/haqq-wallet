import React, {useCallback} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {View, ViewStyle} from 'react-native';

import {Color} from '@app/colors';
import {Text} from '@app/components/ui';
import {createTheme, sendNotification} from '@app/helpers';
import {I18N} from '@app/i18n';

export type DataContentSplittedProps = {
  to: string[];
  title: string;
  style?: ViewStyle;
  reversed?: boolean;
};

export const DataContentSplitted = ({
  to,
  title,
  style,
  reversed = false,
}: DataContentSplittedProps) => {
  const onPress = useCallback(() => {
    Clipboard.setString(to.join(''));
    sendNotification(I18N.notificationCopied);
  }, [to]);

  return (
    <View style={[reversed && styles.reverse, style]}>
      <Text t11 style={styles.address} onPress={onPress}>
        <Text t11 style={styles.address}>
          {to[0]}
        </Text>
        <Text t11 color={Color.textBase2}>
          {to[1]}
        </Text>
        <Text t11>{to[2]}</Text>
      </Text>
      <Text t11 color={Color.textBase2}>
        {
          <Text t11 color={Color.textBase2}>
            {title}
          </Text>
        }
      </Text>
    </View>
  );
};
const styles = createTheme({
  address: {
    minHeight: 22,
    marginBottom: 2,
    textAlign: 'left',
    color: Color.textBase1,
    width: '100%',
  },
  reverse: {flexDirection: 'column-reverse'},
});
