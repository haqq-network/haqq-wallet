import React, {useCallback} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {View} from 'react-native';

import {Button} from '@app/components/ui';
import {RootStackParamList} from '@app/types';

export const HomeStakingScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const onPressValidators = useCallback(() => {
    navigation.navigate('stakingValidators');
  }, [navigation]);
  return (
    <View>
      <Button title="Validators" onPress={onPressValidators} />
    </View>
  );
};
