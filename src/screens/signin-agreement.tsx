import React, {useCallback} from 'react';
import {Dimensions} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {Container} from '../components/container';
import {Button, ButtonVariant, Paragraph, Title} from '../components/ui';
import {Spacer} from '../components/spacer';
import Lottie from 'lottie-react-native';

type SignInAgreementScreenProp = CompositeScreenProps<any, any>;
const windowWidth = Dimensions.get('window').width;

export const SignInAgreementScreen = ({
  navigation,
}: SignInAgreementScreenProp) => {
  const onDone = useCallback(() => {
    navigation.navigate('signin-restore-wallet');
  }, [navigation]);

  return (
    <Container>
      <Spacer>
        <Lottie
          style={{
            position: 'absolute',
            width: windowWidth - 30,
            height: windowWidth - 30,
          }}
          source={require('../../assets/animations/success-animation.json')}
          autoPlay
          loop={false}
        />
      </Spacer>
      <Title style={{marginBottom: 4}}>
        Do you have your recovery phrase or private key?
      </Title>
      <Paragraph style={{marginBottom: 58, textAlign: 'center'}}>
        The recovery phrase is a 12-word phrase that you received when you
        created the wallet. A private key is a key created by you in the
        application
      </Paragraph>
      <Button
        style={{marginBottom: 16}}
        variant={ButtonVariant.contained}
        title="Agree"
        onPress={onDone}
      />
      <Paragraph>
        By clicking Agree you agree to the Terms of Service and Privacy Policy
      </Paragraph>
    </Container>
  );
};
