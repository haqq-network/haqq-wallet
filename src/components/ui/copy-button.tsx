import React, {useCallback, useMemo} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {TouchableOpacity, TouchableOpacityProps} from 'react-native';

import {useApp} from '../../contexts/app';
import {createTheme} from '../../helpers/create-theme';

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
    app.emit('notification', 'Copied');
  }, [app, value]);

  const containerStyle = useMemo(() => [page.container, style], [style]);

  return (
    <TouchableOpacity onPress={onPress} style={containerStyle} {...props}>
      {children}
    </TouchableOpacity>
  );
};

const page = createTheme({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
