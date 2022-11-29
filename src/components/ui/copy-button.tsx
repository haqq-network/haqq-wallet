import React, {useCallback, useMemo} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

import {useApp} from '@app/hooks';
import {I18N, getText} from '@app/i18n';

export type CopyButtonProps = TouchableOpacityProps & {
  value: string;
};

export const CopyButton = ({
  children,
  value,
  style,
  ...props
}: CopyButtonProps) => {
  const app = useApp();
  const onPress = useCallback(() => {
    Clipboard.setString(value);
    app.emit('notification', getText(I18N.notificationCopied));
  }, [app, value]);

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
