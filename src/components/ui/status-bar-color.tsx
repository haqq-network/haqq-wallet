import React from 'react';

import {StatusBar, View} from 'react-native';

import {Color, getColor} from '../../colors';
import {createTheme} from '../../helpers/create-theme';

export const StatusBarColor = ({backgroundColor = null, ...props}) => {
  const bgColor = backgroundColor ?? getColor(Color.bg1);

  return (
    <View style={[page.statusBar, {backgroundColor: bgColor}]}>
      <StatusBar translucent backgroundColor={bgColor} {...props} />
    </View>
  );
};

const page = createTheme({
  statusBar: {
    height: StatusBar.currentHeight,
  },
});
