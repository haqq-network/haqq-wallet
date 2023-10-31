import React, {useCallback, useMemo} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

import {I18N} from '@app/i18n';
import {sendNotification} from '@app/services';

export type CopyButtonProps = TouchableOpacityProps & {
  value: string;
  secondValue?: string;
};

export const CopyButton = ({
  children,
  value,
  secondValue,
  style,
  ...props
}: CopyButtonProps) => {
  const onPress = useCallback(() => {
    Clipboard.setString(value);
    sendNotification(I18N.notificationCopied);
  }, [value]);

  const onLongPress = useCallback(() => {
    if (secondValue) {
      Clipboard.setString(secondValue);
      sendNotification(I18N.notificationCopied);
    }
  }, [secondValue]);

  const containerStyle = useMemo(() => [page.container, style], [style]);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={containerStyle}
      {...props}>
      {children}
    </TouchableOpacity>
  );
};

const page = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
