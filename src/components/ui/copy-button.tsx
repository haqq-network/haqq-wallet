import React, {useCallback, useMemo} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {useApp} from '../../contexts/app';

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
    app.emit('modal', {type: 'confirmation', action: 'copied'});
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
