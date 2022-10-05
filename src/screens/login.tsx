import React from 'react';
import {StyleSheet, Image, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  Button,
  ButtonVariant,
  Container,
  Paragraph,
  Title,
} from '../components/ui';

type LoginScreenProp = CompositeScreenProps<any, any>;

const logoImage = require('../../assets/images/logo-empty.png');

export const LoginScreen = ({navigation}: LoginScreenProp) => {
  return (
    <Container>
      <View style={page.container}>
        <Image source={logoImage} style={page.image} />
        <Title style={page.title}>No wallet is connected</Title>
        <Paragraph style={page.textStyle}>
          You can create a new wallet or connect any existing{'\u00A0'}one
        </Paragraph>
      </View>

      <Button
        style={page.button}
        variant={ButtonVariant.contained}
        title="Create a wallet"
        onPress={() => navigation.navigate('signup', {next: 'create'})}
      />
      <Button
        style={page.button}
        title="I already have a wallet"
        onPress={() => navigation.navigate('signin', {next: 'restore'})}
      />
    </Container>
  );
};

const page = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  image: {marginBottom: 28},
  title: {marginBottom: 4},
  button: {marginBottom: 16},
  textStyle: {textAlign: 'center'},
});
