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
};

export const CopyButton = ({
  children,
  value,
  style,
  ...props
}: CopyButtonProps) => {
  const onPress = useCallback(() => {
    Clipboard.setString(value);
    sendNotification(I18N.notificationCopied);
  }, [value]);

  const containerStyle = useMemo(() => [page.container, style], [style]);

  return (
    <TouchableOpacity onPress={onPress} style={containerStyle} {...props}>
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
