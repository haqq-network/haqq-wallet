import React, {useCallback} from 'react';

import Clipboard from '@react-native-clipboard/clipboard';
import {View, ViewStyle} from 'react-native';

import {Text} from './text';

import {Color} from '../../colors';
import {app} from '../../contexts/app';
import {createTheme} from '../../helpers/create-theme';

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
    app.emit('notification', 'Copied');
  }, [to]);

  return (
    <View style={[reversed && page.reverse, style]}>
      <Text t11 style={page.address} onPress={onPress}>
        <Text t11 style={page.address}>
          {to[0]}
        </Text>
        <Text t11 style={page.t11}>
          {to[1]}
        </Text>
        <Text t11>{to[2]}</Text>
      </Text>
      <Text t11 style={page.t11}>
        {
          <Text t11 style={page.t11}>
            {title}
          </Text>
        }
      </Text>
    </View>
  );
};
const page = createTheme({
  address: {
    minHeight: 22,
    marginBottom: 2,
    textAlign: 'left',
    color: Color.textBase1,
    width: '100%',
  },
  reverse: {flexDirection: 'column-reverse'},
  t11: {color: Color.textBase2},
});
