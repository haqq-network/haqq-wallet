import React from 'react';
import {Image, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {Button, ButtonVariant, Paragraph, Title} from '../components/ui';
import {Container} from '../components/container';

type LoginScreenProp = CompositeScreenProps<any, any>;

const logoImage = require('../../assets/images/logo-empty.png');

export const LoginScreen = ({navigation}: LoginScreenProp) => {
  return (
    <Container>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Image source={logoImage} style={{marginBottom: 28}} />
        <Title style={{marginBottom: 4}}>No wallet is connected</Title>
        <Paragraph style={{textAlign: 'center'}}>
          You can create a new wallet or connect any existing one
        </Paragraph>
      </View>

      <Button
        style={{marginBottom: 16}}
        variant={ButtonVariant.contained}
        title="Create a wallet"
        onPress={() => navigation.navigate('signin', {next: 'create'})}
      />
      <Button
        style={{marginBottom: 16}}
        title="I already have a wallet"
        onPress={() => navigation.navigate('signin', {next: 'restore'})}
      />
    </Container>
  );
};
