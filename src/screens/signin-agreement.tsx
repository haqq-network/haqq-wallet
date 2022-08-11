import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Container} from '../components/container';
import {Button, ButtonVariant, Paragraph, Title} from '../components/ui';
import {Spacer} from '../components/spacer';

type SignInAgreementScreenProp = CompositeScreenProps<any, any>;

export const SignInAgreementScreen = ({
  navigation,
  route,
}: SignInAgreementScreenProp) => {
  return (
    <Container>
      <Spacer />
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
        onPress={() =>
          navigation.navigate('signin-pin', {next: route.params.next})
        }
      />
      <Paragraph>
        By clicking Agree you agree to the Terms of Service and Privacy Policy
      </Paragraph>
    </Container>
  );
};
