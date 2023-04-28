import React, {useCallback} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyleSheet} from 'react-native';

import {Color} from '@app/colors';
import {Icon, IconButton} from '@app/components/ui';
import {RootStackParamList} from '@app/types';

export const NewsButton = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const onPressNews = useCallback(() => {
    navigation.navigate('news');
  }, [navigation]);

  return (
    <IconButton onPress={onPressNews} style={page.container}>
      <Icon name="news" color={Color.graphicBase1} />
    </IconButton>
  );
};

const page = StyleSheet.create({
  container: {marginLeft: 12},
});
