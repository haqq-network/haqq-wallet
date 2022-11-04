import React from 'react';
import {Dimensions, ScrollView, StyleSheet} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '../components/ui';

const animationSize = Dimensions.get('window').width - 116;

export const BackupFinishScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  return (
    <ScrollView
      style={page.popupContainer}
      showsVerticalScrollIndicator={false}>
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
    </ScrollView>
  );
};

const page = StyleSheet.create({
  popupContainer: {marginHorizontal: 20},
  container: {justifyContent: 'center', alignItems: 'center'},
  title: {marginBottom: 40, textAlign: 'center'},
  title0: {textAlign: 'center'},
  button: {marginVertical: 16},
});
