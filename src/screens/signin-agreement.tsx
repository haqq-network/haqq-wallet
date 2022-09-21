import React, {useCallback} from 'react';
import {Dimensions, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {Button, ButtonVariant, Paragraph, Title} from '../components/ui';
import Lottie from 'lottie-react-native';

type SignInAgreementScreenProp = CompositeScreenProps<any, any>;
const windowWidth = Dimensions.get('window').width;

export const SignInAgreementScreen = ({
  navigation,
  route,
}: SignInAgreementScreenProp) => {
  const onDone = useCallback(() => {
    navigation.navigate(route.params.nextScreen ?? 'signinRestoreWallet');
  }, [navigation, route.params.nextScreen]);

  return (
    <>
      <View
        style={{
          position: 'absolute',
          width: windowWidth - 30,
          height: windowWidth - 30,
        }}>
        <Lottie
          source={require('../../assets/animations/success-animation.json')}
          autoPlay
          loop={false}
        />
      </View>
      <View style={{justifyContent: 'flex-end'}}>
        <Title style={{marginBottom: 4}}>
          Do you have your recovery phrase or private key?
        </Title>
        <Paragraph style={{marginBottom: 154, textAlign: 'center'}}>
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
        <Paragraph style={{textAlign: 'center'}}>
          By clicking Agree you agree to the Terms of Service and Privacy Policy
        </Paragraph>
      </View>
    </>
  );
};
