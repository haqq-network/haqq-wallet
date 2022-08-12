import React from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {Container} from '../components/container';
import {Button, ButtonVariant, Title} from '../components/ui';
import {Spacer} from '../components/spacer';

type SignInFinishScreenProp = CompositeScreenProps<any, any>;

export const SignInFinishScreen = ({navigation}: SignInFinishScreenProp) => {
  return (
    <Container>
      <Spacer />
      <Title style={{marginBottom: 76}}>
        Congratulations! You have successfully added a new wallet
      </Title>
      <Button
        style={{marginBottom: 16}}
        variant={ButtonVariant.contained}
        title="Finish"
        onPress={() => navigation.replace('home')}
      />
    </Container>
  );
};
