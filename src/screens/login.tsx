import React from 'react';
import {StyleSheet, Image, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Button, ButtonVariant, Container, Text} from '../components/ui';
import {TEXT_BASE_2} from '../variables';
import {RootStackParamList} from '../types';

const logoImage = require('../../assets/images/logo-empty.png');

export const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  return (
    <Container>
      <View style={page.container}>
        <Image source={logoImage} style={page.image} />
        <Text t4 style={page.title}>
          No wallet is connected
        </Text>
        <Text t11 style={page.textStyle}>
          You can create a new wallet or connect any existing{'\u00A0'}one
        </Text>
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
  textStyle: {textAlign: 'center', color: TEXT_BASE_2},
});
