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
  overlay: {justifyContent: 'center', alignItems: 'center', flex: 1},
  background: {
    backgroundColor: 'rgba(229, 229, 234, 0.82)',
    width: 155,
    height: 155,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  icon: {marginBottom: 19},
  text: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 21,
    textAlign: 'center',
    letterSpacing: -0.32,
  },
});
