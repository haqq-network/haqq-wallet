import React, {useCallback} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import Lottie from 'lottie-react-native';
import {Container} from '../components/container';
import {Button, ButtonVariant, Paragraph, Title} from '../components/ui';
import {Spacer} from '../components/spacer';
import {Dimensions} from 'react-native';

type SignUpAgreementScreenProp = CompositeScreenProps<any, any>;
const windowWidth = Dimensions.get('window').width;
export const SignUpAgreementScreen = ({
  navigation,
  route,
}: SignUpAgreementScreenProp) => {
  const onPressAgree = useCallback(() => {
    navigation.navigate(route.params.nextScreen ?? 'onboarding-setup-pin');
  }, [navigation, route.params.nextScreen]);
  return (
    <Container>
      <Spacer>
        <Lottie
          style={{
            position: 'absolute',
            width: windowWidth - 40,
            height: windowWidth - 40,
          }}
          source={require('../../assets/animations/first-screen-animation.json')}
          autoPlay
          loop
        />
      </Spacer>
      <Title style={{marginBottom: 4}}>Islm - DeFi Wallet</Title>
      <Paragraph style={{marginBottom: 58, textAlign: 'center'}}>
        Islm Wallet does not store, transfer, transmit, convert, hold, or
        otherwise interact with any of the Virtual Currencies you may use with
        the Islm Wallet App. Any transfer or transaction occurs on the Haqq
        Network(s). Islm Wallet cannot block, freeze or take any kind of control
        over your Virtual Currency.
      </Paragraph>
      <Button
        style={{marginBottom: 16}}
        variant={ButtonVariant.contained}
        title="Agree"
        onPress={onPressAgree}
      />
      <Paragraph>
        By clicking Agree you agree to the Terms of Service and Privacy Policy
      </Paragraph>
    </Container>
  );
};
