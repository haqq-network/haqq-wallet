import React, {useCallback} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconButton} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useVariablesBool} from '@app/hooks/use-variables-bool';
import {RootStackParamList} from '@app/types';

export const NewsButton = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const isNewNews = useVariablesBool('isNewNews');

  const onPressNews = useCallback(() => {
    navigation.navigate('news');
  }, [navigation]);

  return (
    <IconButton onPress={onPressNews} style={page.container}>
      <Icon name="news" color={Color.graphicBase1} />
      {isNewNews && <View style={page.hasNews} />}
    </IconButton>
  );
};

const page = createTheme({
  container: {marginLeft: 12, position: 'relative'},
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
