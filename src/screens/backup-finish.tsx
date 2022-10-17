import React from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {
  Button,
  ButtonVariant,
  Container,
  Spacer,
  Text,
  LottieWrap,
} from '../components/ui';

const animationSize = Dimensions.get('window').width - 116;

export const BackupFinishScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  return (
    <Container>
      <Spacer style={page.container}>
        <LottieWrap
          source={require('../../assets/animations/backup-success-animation.json')}
          autoPlay
          loop={false}
          style={{width: animationSize, height: animationSize}}
        />
      </Spacer>
      <Text t4>Congratulations!</Text>
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
    </Container>
  );
};

const page = StyleSheet.create({
  container: {justifyContent: 'center', alignItems: 'center'},
  title: {marginBottom: 40},
  button: {marginVertical: 16},
});
