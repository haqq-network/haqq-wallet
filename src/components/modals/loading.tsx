import React, {useEffect} from 'react';

import {StatusBar, View} from 'react-native';

import {Color, getColor} from '../../colors';
import {createTheme} from '../../helpers/create-theme';
import {Text, Waiting} from '../ui';

export type LoadingModalProps = {
  text?: string;
};
export const LoadingModal = ({text}: LoadingModalProps) => {
  useEffect(() => {
    StatusBar.setBackgroundColor(getColor(Color.graphicGreen2));
    return () => StatusBar.setBackgroundColor(getColor(Color.bg1));
  }, []);
  return (
    <View style={page.container}>
      <Waiting style={page.waiting} />
      {text && (
        <Text t4 style={page.text}>
          {text}
        </Text>
      )}
    </View>
  );
};

const page = createTheme({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: Color.graphicGreen2,
  },
  text: {color: Color.textBase3, width: 230, textAlign: 'center'},
  waiting: {marginBottom: 40},
});
