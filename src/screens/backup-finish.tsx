import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  Button,
  ButtonVariant,
  Container,
  Spacer,
  Title,
  LottieWrap,
} from '../components/ui';
import {Dimensions, StyleSheet} from 'react-native';

type BackupFinishScreenProp = CompositeScreenProps<any, any>;

const animationSize = Dimensions.get('window').width - 116;

export const BackupFinishScreen = ({navigation}: BackupFinishScreenProp) => {
  return (
    <Container>
      <Spacer style={page.container}>
        <LottieWrap
          style={{width: animationSize, height: animationSize}}
          source={require('../../assets/animations/backup-success-animation.json')}
          autoPlay
          loop={false}
        />
      </Spacer>
      <Title>Congratulations!</Title>
      <Title style={page.title}>
        You've successfully protected your wallet.
      </Title>
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
