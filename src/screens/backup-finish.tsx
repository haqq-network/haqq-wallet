import React, {useEffect} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Dimensions, StyleSheet} from 'react-native';

import {HapticEffects, vibrate} from '@app/services/haptic';

import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '../components/ui';
import {RootStackParamList} from '../types';

const animationSize = Dimensions.get('window').width - 116;

export const BackupFinishScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    vibrate(HapticEffects.success);
  }, []);

  return (
    <PopupContainer style={page.popupContainer}>
      <Spacer style={page.container}>
        <LottieWrap
          source={require('../../assets/animations/backup-success-animation.json')}
          autoPlay
          loop={false}
          style={{width: animationSize, height: animationSize}}
        />
      </Spacer>
      <Text t4 style={page.title0}>
        Congratulations!
      </Text>
      <Text t4 style={page.title}>
        You've successfully protected your wallet.
      </Text>
      <Button
        style={page.button}
        variant={ButtonVariant.contained}
        title="Finish"
        onPress={() => {
          navigation.getParent()?.goBack();
        }}
      />
    </PopupContainer>
  );
};

const page = StyleSheet.create({
  popupContainer: {marginHorizontal: 20},
  container: {justifyContent: 'center', alignItems: 'center'},
  title: {marginBottom: 40, textAlign: 'center'},
  title0: {textAlign: 'center'},
  button: {marginVertical: 16},
});
