import React from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Image, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '../colors';
import {Button, ButtonVariant, Text} from '../components/ui';
import {createTheme} from '../helpers/create-theme';
import {RootStackParamList} from '../types';

const logoImage = require('../../assets/images/logo-empty.png');

export const WelcomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        page.container,
        {paddingTop: insets.top, paddingBottom: insets.bottom},
      ]}
      testID="welcome">
      <View style={page.content}>
        <Image source={logoImage} style={page.imageStyle} />
        <Text t4 style={page.title}>
          No wallet is connected
        </Text>
        <Text t11 style={page.textStyle}>
          You can create a new wallet or connect any existing{'\u00A0'}one
        </Text>
      </View>

      <Button
        testID="welcome_signup"
        style={page.button}
        variant={ButtonVariant.contained}
        title="Create a wallet"
        onPress={() => navigation.navigate('signup', {next: 'create'})}
      />
      <Button
        testID="welcome_ledger"
        title="Connect"
        iconRight={<Image source={{uri: 'ledger'}} style={page.ledger} />}
        style={page.button}
        variant={ButtonVariant.second}
        onPress={() => navigation.navigate('ledger')}
      />
      <Button
        testID="welcome_signin"
        style={page.button}
        title="I already have a wallet"
        onPress={() => navigation.navigate('signin', {next: 'restore'})}
      />
    </View>
  );
};

const page = createTheme({
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
  content: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  title: {marginBottom: 4},
  button: {marginBottom: 16},
  textStyle: {
    textAlign: 'center',
    color: Color.textBase2,
  },
  imageStyle: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 28,
    tintColor: Color.graphicSecond2,
  },
  ledger: {
    width: 22,
    height: 22,
  },
});
