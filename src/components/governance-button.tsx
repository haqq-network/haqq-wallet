import React, {useCallback} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {Color} from '@app/colors';
import {Icon, IconButton} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {RootStackParamList} from '@app/types';

export const GovernanceButton = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const onPressNews = useCallback(() => {
    navigation.navigate('governance');
  }, [navigation]);

  return (
    <IconButton onPress={onPressNews} style={page.container}>
      <Icon name="governance" color={Color.graphicBase1} />
    </IconButton>
  );
};

const page = createTheme({
  container: {marginLeft: 12, position: 'relative'},
  // hasNews: {
  //   top: -2,
  //   right: -2,
  //   position: 'absolute',
  //   padding: 2,
  //   borderRadius: 5,
  //   width: 10,
  //   height: 10,
  //   borderWidth: 2,
  //   borderColor: Color.bg1,
  //   backgroundColor: Color.graphicRed1,
  // },
});
