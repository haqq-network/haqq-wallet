import React, {PropsWithChildren, useCallback} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {TouchableWithoutFeedback, View} from 'react-native';

import {Icon, IconsName} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {sendNotification} from '@app/services';
import {Color, createTheme} from '@app/theme';

type AddressInfoProps = {
  copyValue?: string;
};

export const AddressInfo = ({
  copyValue,
  children,
}: PropsWithChildren<AddressInfoProps>) => {
  const onPress = useCallback(() => {
    if (copyValue) {
      Clipboard.setString(copyValue);
      sendNotification(I18N.notificationCopied);
    }
  }, []);
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.addressContainer}>
        {children}
        {Boolean(copyValue) && (
          <>
            <View style={styles.vDevider} />
            <Icon i18 name={IconsName.copy} color={Color.textBase2} />
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = createTheme({
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  vDevider: {
    width: 8,
  },
});
