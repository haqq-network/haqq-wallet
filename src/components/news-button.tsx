import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {Icon} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useVariablesBool} from '@app/hooks/use-variables-bool';

export interface NewsButtonProps {
  focused: boolean;
}

export const NewsButton = ({focused}: NewsButtonProps) => {
  const isNewNews = useVariablesBool('isNewNews');
  const isNewRssNews = useVariablesBool('isNewRssNews');
  const haveNewNews = isNewRssNews || isNewNews;

  return (
    <View style={page.container}>
      <Icon
        name="news"
        color={focused ? Color.graphicGreen1 : Color.graphicBase2}
      />
      {haveNewNews && <View style={page.hasNews} />}
    </View>
  );
};

const page = createTheme({
  container: {position: 'relative'},
  hasNews: {
    top: -2,
    right: -2,
    position: 'absolute',
    padding: 2,
    borderRadius: 5,
    width: 10,
    height: 10,
    borderWidth: 2,
    borderColor: Color.bg1,
    backgroundColor: Color.graphicRed1,
  },
});
