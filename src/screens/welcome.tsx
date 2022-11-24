import React from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Image, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color} from '@app/colors';
import {I18N} from '@app/i18n';

import {Button, ButtonVariant, Text} from '../components/ui';
import {RootStackParamList} from '../types';

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
        <Image
          source={require('../../assets/images/logo-empty.png')}
          style={page.imageStyle}
        />
        <Text t4 style={page.title} i18n={I18N.welcomeTitle} />
        <Text
          t11
          center
          color={Color.textBase2}
          i18n={I18N.welcomeDescription}
        />
      </View>

      <Button
        i18n={I18N.welcomeCreateWallet}
        testID="welcome_signup"
        style={page.button}
        variant={ButtonVariant.contained}
        onPress={() => navigation.navigate('signup', {next: 'create'})}
      />
      <Button
        testID="welcome_ledger"
        i18n={I18N.welcomeLedgerWallet}
        iconRight="ledger"
        iconRightColor={Color.graphicGreen1}
        style={page.button}
        variant={ButtonVariant.second}
        onPress={() => navigation.navigate('ledger')}
      />
      <Button
        testID="welcome_signin"
        i18n={I18N.welcomeRestoreWallet}
        style={page.button}
        onPress={() => navigation.navigate('signin', {next: 'restore'})}
      />
    </View>
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 4,
  },
  button: {
    marginBottom: 16,
  },
  imageStyle: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 28,
  },
});
