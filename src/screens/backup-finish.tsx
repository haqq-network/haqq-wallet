import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  Button,
  ButtonVariant,
  Container,
  Spacer,
  Title,
} from '../components/ui';
import Lottie from 'lottie-react-native';
import {Dimensions} from 'react-native';

type BackupFinishScreenProp = CompositeScreenProps<any, any>;

const animationSize = Dimensions.get('window').width - 116;

export const BackupFinishScreen = ({navigation}: BackupFinishScreenProp) => {
  return (
    <Container>
      <Spacer style={{justifyContent: 'center', alignItems: 'center'}}>
        <Lottie
          style={{width: animationSize, height: animationSize}}
          source={require('../../assets/animations/backup-success-animation.json')}
          autoPlay
          loop={false}
        />
      </Spacer>
      <Title>Congratulations!</Title>
      <Title style={{marginBottom: 40}}>
        You've successfully protected your wallet.
      </Title>
      <Button
        style={{marginVertical: 16}}
        variant={ButtonVariant.contained}
        title="Finish"
        onPress={() => {
          navigation.getParent()?.goBack();
        }}
      />
    </Container>
  );
};
